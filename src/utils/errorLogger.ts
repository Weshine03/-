/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ClientErrorLog {
  id: string;
  timestamp: string;
  type: 'image_load_failure' | 'image_retry' | 'api_error' | 'timeout' | 'system';
  message: string;
  context?: Record<string, any>;
}

const MAX_LOGS = 50;
const errorLogs: ClientErrorLog[] = [];

/**
 * Log client-side issues safely without exposing student personal information.
 */
export function logClientError(
  type: ClientErrorLog['type'],
  message: string,
  context?: Record<string, any>
): void {
  const logItem: ClientErrorLog = {
    id: `err_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    type,
    message,
    context: context ? sanitizeContext(context) : undefined,
  };

  errorLogs.unshift(logItem);
  if (errorLogs.length > MAX_LOGS) {
    errorLogs.pop();
  }

  // Also forward to server log endpoint (fire-and-forget, non-blocking)
  if (typeof window !== 'undefined' && typeof fetch === 'function') {
    fetch('/api/client-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logItem),
    }).catch(() => {});
  }

  // Also log to console for developer diagnostics
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`[ClientErrorLogger] [${type}] ${message}`, context || '');
  }
}

export function getClientErrorLogs(): ClientErrorLog[] {
  return [...errorLogs];
}

export function clearClientErrorLogs(): void {
  errorLogs.length = 0;
}

function sanitizeContext(ctx: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  for (const [key, val] of Object.entries(ctx)) {
    // Avoid storing user sentence inputs or personal names
    if (/name|student|sentence|auth|token|user/i.test(key)) {
      continue;
    }
    sanitized[key] = val;
  }
  return sanitized;
}
