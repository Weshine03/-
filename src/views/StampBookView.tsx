/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Award, Lock, Sparkles, Compass } from 'lucide-react';
import { Mission, RoundData, SENSORY_NAMES } from '../types/index.ts';
import { StampBadge } from '../components/StampBadge.tsx';
import { loadAllRounds, getCurrentRound } from '../utils/storage.ts';

interface StampBookViewProps {
  onSelectMissionIndex: (index: number) => void;
}

export const StampBookView: React.FC<StampBookViewProps> = ({
  onSelectMissionIndex,
}) => {
  const rounds = loadAllRounds();
  const currentRound = getCurrentRound();
  const [selectedRoundId, setSelectedRoundId] = useState<string>(currentRound.roundId);

  const activeRound = rounds.find((r) => r.roundId === selectedRoundId) || currentRound;
  const missions = activeRound.missions;

  // Compute all-time stamps across all rounds
  let allTimePassedCount = 0;
  let allTimeFullStarsCount = 0;
  rounds.forEach((r) => {
    r.missions.forEach((m) => {
      const p = r.progress[m.id];
      if (p?.isPassed) allTimePassedCount++;
      if (p?.isFullStars) allTimeFullStarsCount++;
    });
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0B2545] via-[#134074] to-[#007EA7] rounded-3xl p-6 sm:p-8 text-white shadow-md shadow-sky-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-xs">
              <Compass className="w-3.5 h-3.5" />
              <span>摹寫領航員榮譽榜</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              五感航海圖章日誌
            </h2>
            <p className="text-xs sm:text-sm text-sky-100">
              每寫出一句清晰具體的五感描寫，就能在航海日誌蓋上一枚專屬領航徽章！
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/20">
            <div className="text-center">
              <div className="text-2xl font-black tabular-nums">{allTimePassedCount}</div>
              <div className="text-[11px] text-sky-100">歷次通關圖章</div>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="text-center">
              <div className="text-2xl font-black text-amber-300 tabular-nums">
                {allTimeFullStarsCount}
              </div>
              <div className="text-[11px] text-sky-100">滿星領航金章</div>
            </div>
          </div>
        </div>
      </div>

      {/* Round Filter Tabs */}
      {rounds.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {rounds.map((r) => (
            <button
              key={r.roundId}
              onClick={() => setSelectedRoundId(r.roundId)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                selectedRoundId === r.roundId
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              第 {r.roundNumber} 輪印章
            </button>
          ))}
        </div>
      )}

      {/* Grid of Stamps for Active Round */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {missions.map((mission, index) => {
          const prog = activeRound.progress[mission.id];
          const isPassed = Boolean(prog?.isPassed);
          const isFull = Boolean(prog?.isFullStars);
          const sensory = SENSORY_NAMES[mission.sensoryType];

          return (
            <div
              key={mission.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col items-center text-center space-y-3 ${
                isPassed
                  ? 'bg-white border-slate-200 shadow-xs hover:border-amber-300'
                  : 'bg-slate-50/60 border-dashed border-slate-300'
              }`}
            >
              <div className="text-[11px] font-bold text-slate-500">
                關卡 {index + 1}：{sensory.name}
              </div>

              {/* Badge Display */}
              <div className="py-2">
                {isPassed ? (
                  <StampBadge
                    name={isFull ? mission.fullStampName : mission.stampName}
                    icon={isFull ? mission.fullStampIcon : mission.stampIcon}
                    isFullStar={isFull}
                    earnedDate={prog?.passedAt}
                    size="sm"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 bg-slate-100/50">
                    <Lock className="w-5 h-5 mb-1" />
                    <span className="text-[10px]">尚未通關</span>
                  </div>
                )}
              </div>

              <div className="text-xs font-bold text-slate-800 line-clamp-1">
                {mission.title}
              </div>

              <div className="text-[11px] text-slate-500 min-h-[28px] leading-tight">
                {isFull
                  ? '🌟 榮獲滿星五星大師！'
                  : isPassed
                  ? '🎉 成功達到 4 星通關！'
                  : '完成描寫即可解鎖'}
              </div>

              {selectedRoundId === currentRound.roundId && (
                <button
                  type="button"
                  onClick={() => onSelectMissionIndex(index)}
                  className={`w-full py-1.5 px-2 text-[11px] font-bold rounded-xl transition-colors cursor-pointer ${
                    isPassed
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      : 'bg-amber-500 text-white hover:bg-amber-600 shadow-xs'
                  }`}
                >
                  {isPassed ? '重溫這道關卡' : '前往挑戰此關'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
