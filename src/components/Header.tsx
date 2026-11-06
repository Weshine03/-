/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Compass, BookOpen, Award, Sparkles } from 'lucide-react';

export type ActiveTab = 'expedition' | 'settlement' | 'stamps' | 'dictionary';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  earnedStampsCount: number;
  totalMissionsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  earnedStampsCount,
  totalMissionsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Brand Wordmark & Compass */}
          <div
            onClick={() => onSelectTab('expedition')}
            className="flex items-center gap-2.5 cursor-pointer whitespace-nowrap shrink-0 select-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-700 via-sky-800 to-cyan-900 flex items-center justify-center text-amber-300 shadow-xs group-hover:scale-105 transition-transform border border-amber-400/40">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-slate-900 leading-none flex items-center gap-1.5">
                <span>摹寫領航員</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-sky-100 text-sky-800 font-extrabold border border-sky-200">
                  航海版
                </span>
              </span>
              <span className="text-[11px] text-sky-800 font-medium tracking-tight mt-0.5">
                揚起五感風帆，航向寫作新海域
              </span>
            </div>
          </div>

          {/* Student Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => onSelectTab('expedition')}
              className={`transition-colors whitespace-nowrap shrink-0 py-1 cursor-pointer ${
                activeTab === 'expedition'
                  ? 'text-sky-900 font-bold border-b-2 border-sky-600'
                  : 'hover:text-slate-900'
              }`}
            >
              五感航線任務
            </button>

            <button
              onClick={() => onSelectTab('stamps')}
              className={`transition-colors whitespace-nowrap shrink-0 py-1 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'stamps'
                  ? 'text-sky-900 font-bold border-b-2 border-sky-600'
                  : 'hover:text-slate-900'
              }`}
            >
              <Award className="w-4 h-4 text-amber-500" />
              <span>航海印章簿</span>
              <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-bold tabular-nums">
                {earnedStampsCount}
              </span>
            </button>

            <button
              onClick={() => onSelectTab('dictionary')}
              className={`transition-colors whitespace-nowrap shrink-0 py-1 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'dictionary'
                  ? 'text-sky-900 font-bold border-b-2 border-sky-600'
                  : 'hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4 text-sky-600" />
              <span>詞語小百科</span>
            </button>
          </nav>

          {/* Student Status Action Pill */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onSelectTab('stamps')}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 text-sky-900 shadow-xs hover:border-sky-300 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>已解鎖印章</span>
              <span className="px-1.5 py-0.2 bg-amber-400 text-amber-950 rounded-full font-black text-[11px]">
                {earnedStampsCount}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-100 bg-sky-50/70 px-2 py-1.5 text-xs">
        <button
          onClick={() => onSelectTab('expedition')}
          className={`py-1.5 px-3 font-medium rounded-lg cursor-pointer ${
            activeTab === 'expedition' ? 'bg-sky-200/80 text-sky-950 font-bold' : 'text-slate-700'
          }`}
        >
          五感航線
        </button>
        <button
          onClick={() => onSelectTab('stamps')}
          className={`py-1.5 px-3 font-medium rounded-lg cursor-pointer flex items-center gap-1 ${
            activeTab === 'stamps' ? 'bg-sky-200/80 text-sky-950 font-bold' : 'text-slate-700'
          }`}
        >
          <span>印章簿</span>
          <span className="text-[10px] bg-amber-300 text-amber-950 px-1 rounded-full font-bold">
            {earnedStampsCount}
          </span>
        </button>
        <button
          onClick={() => onSelectTab('dictionary')}
          className={`py-1.5 px-3 font-medium rounded-lg cursor-pointer ${
            activeTab === 'dictionary' ? 'bg-sky-200/80 text-sky-950 font-bold' : 'text-slate-700'
          }`}
        >
          詞語小百科
        </button>
      </div>
    </header>
  );
};
