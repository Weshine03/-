/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Compass, ArrowRight, Anchor, Navigation, Waves } from 'lucide-react';

interface HomeViewProps {
  onStartStudent: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onStartStudent }) => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-10 bg-gradient-to-b from-sky-50/60 via-slate-50 to-blue-50/40">
      <div className="w-full max-w-2xl text-center space-y-8">
        {/* Maritime Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-100 text-sky-900 border border-sky-200/80 text-xs font-bold shadow-xs">
          <Anchor className="w-4 h-4 text-sky-700" />
          <span>國小三年級五感摹寫學習 · 航海冒險導航</span>
        </div>

        {/* Brand Icon & Title Lockup */}
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-700 via-sky-800 to-cyan-900 text-amber-300 shadow-xl shadow-sky-900/20 border-2 border-amber-400/40 animate-pulse-slow">
            <Compass className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 font-display">
              摹寫領航員
            </h1>
            <p className="text-lg sm:text-xl text-sky-800 font-semibold tracking-tight">
              揚起五感風帆，航向寫作新海域
            </p>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed pt-1">
              駕駛你的探索船隻，循序探索視覺、聽覺、嗅覺、味覺與觸覺五大海域。
              一步一步，用自己的話把感受寫得更清楚！
            </p>
          </div>
        </div>

        {/* Nautical Highlights for 3rd Graders */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
          <div className="p-3 bg-white rounded-xl border border-sky-100 shadow-xs space-y-1">
            <div className="text-base select-none">🗺️</div>
            <div className="text-xs font-bold text-slate-800">五感海域</div>
            <div className="text-[11px] text-slate-500">五大專屬感官航線</div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-sky-100 shadow-xs space-y-1">
            <div className="text-base select-none">🧭</div>
            <div className="text-xs font-bold text-slate-800">循序思考</div>
            <div className="text-[11px] text-slate-500">逐步提問自主修改</div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-sky-100 shadow-xs space-y-1">
            <div className="text-base select-none">📜</div>
            <div className="text-xs font-bold text-slate-800">航海日誌</div>
            <div className="text-[11px] text-slate-500">完整保存修改足跡</div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-sky-100 shadow-xs space-y-1">
            <div className="text-base select-none">🎖️</div>
            <div className="text-xs font-bold text-slate-800">領航圖章</div>
            <div className="text-[11px] text-slate-500">通關收集專屬徽章</div>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="pt-2">
          <button
            onClick={onStartStudent}
            className="w-full py-4.5 px-8 rounded-2xl bg-gradient-to-r from-blue-700 via-sky-700 to-cyan-700 hover:from-blue-800 hover:to-cyan-800 active:scale-98 text-white font-black text-lg sm:text-xl shadow-lg shadow-sky-700/25 transition-all flex items-center justify-center gap-3 cursor-pointer group border border-sky-400/30"
          >
            <Navigation className="w-6 h-6 text-amber-300 group-hover:rotate-12 transition-transform" />
            <span>啟航！開始五感航線探索</span>
            <ArrowRight className="w-6 h-6 text-amber-200 group-hover:translate-x-1.5 transition-transform" />
          </button>
        </div>

        {/* Quiet footer note */}
        <div className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <Waves className="w-3.5 h-3.5 text-sky-400" />
          <span>以學生為中心 · 形成性回饋輔助工具 · 4星即可順利通關</span>
        </div>
      </div>
    </div>
  );
};
