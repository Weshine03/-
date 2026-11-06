/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BookOpen, Sparkles, Info, Compass } from 'lucide-react';
import { Mission } from '../types/index.ts';

interface DictionaryExplorerViewProps {
  missions: Mission[];
}

export const DictionaryExplorerView: React.FC<DictionaryExplorerViewProps> = ({ missions }) => {
  const [selectedMissionId, setSelectedMissionId] = useState<string>(missions[0]?.id || '');
  const activeMission = missions.find((m) => m.id === selectedMissionId) || missions[0];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner */}
      <div className="bg-amber-500 rounded-3xl p-6 sm:p-8 text-white shadow-md shadow-amber-200 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-xs">
          <BookOpen className="w-3.5 h-3.5" />
          <span>五感觀察工具箱</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
          摹寫詞語小百科
        </h2>
        <p className="text-xs sm:text-sm text-amber-100 max-w-2xl leading-relaxed">
          這裡收集了視覺、聽覺、嗅覺、味覺與觸覺的豐富生活詞語，提供你觀察的方向與靈感。
        </p>
      </div>

      {/* Educational Notice Banner */}
      <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-start gap-3 text-xs text-amber-950">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">摹寫探險隊原則：</span>
          詞語小百科是輔助觀察的工具箱，不是標準答案庫。每種物品都有獨特的面貌，請依照你自己親身的觀察與感受來選擇，不用勉強塞進每一個詞語，簡短真實的句子最動人！
        </div>
      </div>

      {/* Theme Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {missions.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelectedMissionId(m.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 border ${
              selectedMissionId === m.id
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>{m.stampIcon}</span>
            <span className="ml-1.5">{m.title}</span>
          </button>
        ))}
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeMission.dictionaryCategories.map((cat, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3"
          >
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{cat.category}</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">{cat.hint}</p>

            <div className="flex flex-wrap gap-2 pt-2">
              {cat.words.map((word, wIdx) => (
                <div
                  key={wIdx}
                  className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 select-none cursor-default transition-colors"
                >
                  {word}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
