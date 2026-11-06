/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { CriterionResult } from '../types/index.ts';

interface CriteriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  criteria: CriterionResult[];
  studentSentence: string;
  totalScore: number;
}

export const CriteriaModal: React.FC<CriteriaModalProps> = ({
  isOpen,
  onClose,
  criteria,
  studentSentence,
  totalScore,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              五項摹寫標準檢查表
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              依據文字證據逐項客觀檢視，總得分：{totalScore} / 5 顆星
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="關閉"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
          {/* Student sentence card */}
          <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/70">
            <div className="text-xs font-semibold text-amber-800 mb-1">
              學生提交句子：
            </div>
            <div className="text-base text-slate-800 font-medium leading-relaxed">
              「{studentSentence}」
            </div>
          </div>

          {/* Criteria list */}
          <div className="space-y-3">
            {criteria.map((item, index) => {
              const isMet = item.score === 1;
              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isMet
                      ? 'border-emerald-200 bg-emerald-50/30'
                      : 'border-slate-200 bg-slate-50/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      {isMet ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="text-sm font-bold text-slate-900">
                          {index + 1}. {item.name}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`text-xs font-bold px-2.5 py-1 rounded-md shrink-0 ${
                        isMet
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {item.score} 分
                    </div>
                  </div>

                  <div className="mt-2.5 pl-7 text-xs space-y-1.5 text-slate-600">
                    <div>
                      <span className="font-semibold text-slate-700">文字證據：</span>{' '}
                      {item.evidence ? (
                        <span className="font-medium text-emerald-800 bg-emerald-100/60 px-1.5 py-0.5 rounded">
                          「{item.evidence}」
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">無直接文字引用</span>
                      )}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">判定依據：</span>{' '}
                      {item.reason}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            知道了
          </button>
        </div>
      </div>
    </div>
  );
};
