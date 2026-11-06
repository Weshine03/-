/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowRight, Sparkles, TrendingUp, AlertCircle, History } from 'lucide-react';
import { AttemptRecord } from '../types/index.ts';
import { StarDisplay } from './StarDisplay.tsx';

interface VersionComparisonProps {
  previousAttempt?: AttemptRecord | null;
  latestAttempt: AttemptRecord;
}

export const VersionComparison: React.FC<VersionComparisonProps> = ({
  previousAttempt,
  latestAttempt,
}) => {
  // Requirement 5.5: 第一次作答沒有前一次提交紀錄時，不顯示「看見你的進步」或「再接再厲」的比較欄位
  if (!previousAttempt || previousAttempt.id === latestAttempt.id) {
    return null;
  }

  const prevScore = previousAttempt.totalScore;
  const currScore = latestAttempt.totalScore;

  const isScoreHigher = currScore > prevScore;
  const isScoreLower = currScore < prevScore;

  // Requirement 5.2: 若修改後的句子星等與前一次相同，不顯示「看見你的進步」欄位
  if (!isScoreHigher && !isScoreLower) {
    return null;
  }

  // Content determination
  let comparisonNote = latestAttempt.comparisonContent;
  if (!comparisonNote) {
    if (isScoreHigher) {
      if (prevScore === 0) {
        comparisonNote = `你將原本未達標的語句，修改成完整且符合感官的句子，成功獲得了星等！`;
      } else {
        comparisonNote = `你在這次修改中豐富了具體特徵與描述細節，比前一次（${prevScore}星）更加清晰生動！`;
      }
    } else {
      if (!latestAttempt.isCompleteSentence) {
        comparisonNote = `再接再厲！這次修改後的句子不完整，缺少了能獨立表達意思的內容。請參考前一次的句子，把想表達的內容寫完整。`;
      } else if (!latestAttempt.sensoryMatch) {
        comparisonNote = `再接再厲！這次修改後的內容偏離了本關指定的感官。請回想專屬於這項感官的體驗，把觀察焦點拉回來喔！`;
      } else {
        comparisonNote = `再接再厲！這次修改後比前一次（${prevScore}星）少了具體細節。別灰心，回想剛才注意到的特色，再試著放回句子裡！`;
      }
    }
  }

  return (
    <div className="p-5 bg-white rounded-2xl border border-sky-100 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-sky-700" />
          <h4 className="text-sm font-bold text-slate-900">
            最近兩次修改對照（{previousAttempt.label} ➔ {latestAttempt.label}）
          </h4>
        </div>
        <div className="text-xs text-slate-500 font-medium">
          星等變化：{prevScore}★ ➔ {currScore}★
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Previous Attempt */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600">{previousAttempt.label}</span>
            <StarDisplay score={prevScore} size="sm" />
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
            「{previousAttempt.studentSentence}」
          </p>
        </div>

        {/* Latest Attempt */}
        <div
          className={`p-3.5 rounded-xl border space-y-2 ${
            isScoreHigher
              ? 'bg-emerald-50/70 border-emerald-200'
              : 'bg-amber-50/70 border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span
              className={`font-bold ${
                isScoreHigher ? 'text-emerald-800' : 'text-amber-900'
              }`}
            >
              {latestAttempt.label}（當前版本）
            </span>
            <StarDisplay score={currScore} size="sm" />
          </div>
          <p className="text-xs sm:text-sm text-slate-900 font-semibold leading-relaxed">
            「{latestAttempt.studentSentence}」
          </p>
        </div>
      </div>

      {/* Requirement 5.1: 若修改後的句子星等高於前一次，顯示「看見你的進步」 */}
      {isScoreHigher && (
        <div className="p-3.5 bg-emerald-50/90 rounded-xl border border-emerald-300 text-xs text-emerald-950 flex items-start gap-2 shadow-xs">
          <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-emerald-900 block">看見你的進步：</span>
            <p className="text-emerald-900 leading-relaxed font-medium">
              {comparisonNote}
            </p>
          </div>
        </div>
      )}

      {/* Requirement 5.3 & 5.4: 若修改後的句子星等低於前一次，改為顯示「再接再厲」 */}
      {isScoreLower && (
        <div className="p-3.5 bg-amber-50/90 rounded-xl border border-amber-300 text-xs text-amber-950 flex items-start gap-2 shadow-xs">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-amber-900 block">再接再厲：</span>
            <p className="text-amber-900 leading-relaxed font-medium">
              {comparisonNote}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
