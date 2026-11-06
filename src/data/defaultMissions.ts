/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Mission } from '../types/index.ts';
import { QUESTION_BANK, generateRoundMissions } from './questionBank.ts';

export { QUESTION_BANK, generateRoundMissions };

// Build 10 Distinct 5-Sense Preset Rounds directly from the 50-Question Bank
// Each round contains visual, auditory, olfactory, gustatory, tactile (50 unique questions total)
export const ROUND_PRESET_SETS: Mission[][] = Array.from({ length: 10 }, (_, roundIdx) => {
  const vis = QUESTION_BANK.find((q) => q.id === `q_vis_${String(roundIdx + 1).padStart(2, '0')}`)!;
  const aud = QUESTION_BANK.find((q) => q.id === `q_aud_${String(roundIdx + 1).padStart(2, '0')}`)!;
  const olf = QUESTION_BANK.find((q) => q.id === `q_olf_${String(roundIdx + 1).padStart(2, '0')}`)!;
  const gus = QUESTION_BANK.find((q) => q.id === `q_gus_${String(roundIdx + 1).padStart(2, '0')}`)!;
  const tac = QUESTION_BANK.find((q) => q.id === `q_tac_${String(roundIdx + 1).padStart(2, '0')}`)!;

  // Strictly sequential 5 senses across all rounds: Visual -> Auditory -> Olfactory -> Gustatory -> Tactile
  const canonicalMissions = [vis, aud, olf, gus, tac];

  return canonicalMissions.map((m, stageIdx) => ({
    ...m,
    subtitle: `第 ${stageIdx + 1} 個海域：${getSensoryStageName(m.sensoryType)} · ${m.title}`,
  }));
});

export const DEFAULT_MISSIONS = ROUND_PRESET_SETS[0];

function getSensoryStageName(type: string): string {
  switch (type) {
    case 'visual': return '視覺觀察';
    case 'auditory': return '聽覺觀察';
    case 'olfactory': return '嗅覺觀察';
    case 'gustatory': return '味覺觀察';
    case 'tactile': return '觸覺觀察';
    default: return '感官觀察';
  }
}

export const CRITERIA_METADATA = [
  {
    id: 'subject' as const,
    name: '描寫對象明確',
    description: '讀者能辨認你正在描寫的主體。',
  },
  {
    id: 'feature' as const,
    name: '具有具體特徵',
    description: '至少呈現一項外觀、動作、形狀、聲音、氣味或觸感等可辨識特徵。',
  },
  {
    id: 'word_choice' as const,
    name: '詞語選用精確',
    description: '用詞符合描寫對象與情境，意思清楚明白。',
  },
  {
    id: 'detail' as const,
    name: '描寫細節豐富',
    description: '提供相關細節，讓讀者更容易想像畫面。',
  },
  {
    id: 'vividness' as const,
    name: '生動且有特色',
    description: '呈現值得注意的細微觀察、具體動作或真切感受。',
  },
];
