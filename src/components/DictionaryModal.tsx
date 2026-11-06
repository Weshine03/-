/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, BookOpen, Sparkles, Info } from 'lucide-react';
import { Mission } from '../types/index.ts';

interface DictionaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  mission: Mission;
}

export const DictionaryModal: React.FC<DictionaryModalProps> = ({
  isOpen,
  onClose,
  mission,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-amber-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                摹寫詞語小百科
              </h3>
              <p className="text-xs text-slate-500">
                主題：{mission.title}（觀察參考小幫手）
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="關閉"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice banner */}
        <div className="px-6 py-3 bg-amber-50/60 border-b border-amber-100 flex items-start gap-2.5 text-xs text-amber-900">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">溫馨提醒：</span>
            這些詞語就像調色盤上的顏料，提供你觀察的方向。不用全部用到，請用你自己的話來寫，不要死記或照抄喔！
          </div>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-5">
          {mission.dictionaryCategories.map((cat, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
                <Sparkles className="w-4 h-4 text-amber-500" />
                {cat.category}
              </div>
              <p className="text-xs text-slate-500">{cat.hint}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {cat.words.map((word, wIdx) => (
                  <span
                    key={wIdx}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100/80 rounded-lg border border-slate-200 select-none cursor-default"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>※ 詞語小百科僅供思考觀察方向，無法直接點擊插入句子</span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            回到我的句子
          </button>
        </div>
      </div>
    </div>
  );
};
