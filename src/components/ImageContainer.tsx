/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { logClientError } from '../utils/errorLogger.ts';

interface ImageContainerProps {
  src: string;
  alt: string;
  title: string;
  sensoryType?: string;
  nextImageSrc?: string;
  className?: string;
}

export const ImageContainer: React.FC<ImageContainerProps> = ({
  src,
  alt,
  title,
  sensoryType,
  nextImageSrc,
  className = '',
}) => {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [retryCount, setRetryCount] = useState(0);
  const [currentSrc, setCurrentSrc] = useState(src);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync with prop changes
  useEffect(() => {
    setStatus('loading');
    setRetryCount(0);
    setCurrentSrc(src);
  }, [src]);

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Background preloading for the next stage's image
  useEffect(() => {
    if (!nextImageSrc || typeof window === 'undefined') return;
    try {
      const preloadImg = new Image();
      preloadImg.src = nextImageSrc;
    } catch {
      // Ignored non-fatal preload failure
    }
  }, [nextImageSrc]);

  const handleLoad = useCallback(() => {
    setStatus('loaded');
  }, []);

  const handleError = useCallback(() => {
    if (retryCount < 2) {
      const nextAttempt = retryCount + 1;
      setRetryCount(nextAttempt);
      setStatus('loading');

      logClientError('image_retry', `自動重試第 ${nextAttempt} 次載入題目素材`, {
        title,
        src,
        attempt: nextAttempt,
      });

      const delay = nextAttempt === 1 ? 600 : 1200;
      timerRef.current = setTimeout(() => {
        // Append or refresh cache-buster param if remote URL to bypass transient network glitch
        if (src.startsWith('http')) {
          const separator = src.includes('?') ? '&' : '?';
          setCurrentSrc(`${src}${separator}_retry=${Date.now()}`);
        } else {
          setCurrentSrc(src);
        }
      }, delay);
    } else {
      setStatus('error');
      logClientError('image_load_failure', `素材圖片載入失敗（已達最大重試次數）`, {
        title,
        src,
        sensoryType,
      });
    }
  }, [retryCount, src, title, sensoryType]);

  const handleManualRetry = () => {
    setStatus('loading');
    setRetryCount(0);
    if (src.startsWith('http')) {
      const separator = src.includes('?') ? '&' : '?';
      setCurrentSrc(`${src}${separator}_retry=${Date.now()}`);
    } else {
      setCurrentSrc(src);
    }
  };

  return (
    <div
      className={`relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-inner flex items-center justify-center ${className}`}
      style={{ minHeight: '260px' }}
    >
      {/* Loading Skeleton / Shimmer */}
      {status === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-sky-50/60 to-slate-200 animate-pulse z-10 p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-sky-200/80 flex items-center justify-center mb-3 text-2xl shadow-sm animate-spin" style={{ animationDuration: '3s' }}>
            🧭
          </div>
          <p className="text-sm font-bold text-sky-800 tracking-wide">
            素材載入中...
          </p>
          {retryCount > 0 && (
            <p className="text-xs text-sky-600/90 mt-1">
              正在進行自動連線重試（第 {retryCount}/2 次）
            </p>
          )}
        </div>
      )}

      {/* Actual Image */}
      {status !== 'error' && (
        <img
          key={currentSrc}
          src={currentSrc}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            status === 'loaded' ? 'opacity-100' : 'opacity-0'
          }`}
          loading="eager"
        />
      )}

      {/* Fallback Card with manual retry and experience recall hint */}
      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-sky-300/60 p-6 text-center z-10">
          <div className="w-12 h-12 rounded-2xl bg-amber-100/90 text-amber-700 flex items-center justify-center text-2xl mb-3 shadow-sm">
            ⛵
          </div>
          <h4 className="text-base font-bold text-slate-800 mb-1">
            暫時無法顯示【{title}】的參考素材
          </h4>
          <p className="text-xs text-slate-600 max-w-sm leading-relaxed mb-4">
            💡 沒關係！請依據你在生活中的經驗與記憶，繼續寫下觀察與描寫句子，完全不影響作答與評分喔！
          </p>
          <button
            type="button"
            onClick={handleManualRetry}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white text-sky-700 border border-sky-300 hover:bg-sky-50 active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            <span>🔄</span>
            <span>重新嘗試載入</span>
          </button>
        </div>
      )}
    </div>
  );
};
