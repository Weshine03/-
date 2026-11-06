/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header, ActiveTab } from './components/Header.tsx';
import { HomeView } from './views/HomeView.tsx';
import { StudentExpeditionView } from './views/StudentExpeditionView.tsx';
import { RoundSettlementView } from './views/RoundSettlementView.tsx';
import { StampBookView } from './views/StampBookView.tsx';
import { DictionaryExplorerView } from './views/DictionaryExplorerView.tsx';
import { getCurrentRound, createNewRound, loadAllRounds } from './utils/storage.ts';
import { RoundData } from './types/index.ts';

export default function App() {
  const [currentRound, setCurrentRound] = useState<RoundData>(() => getCurrentRound());
  const [activeTab, setActiveTab] = useState<ActiveTab | 'home'>('home');
  const [currentMissionIndex, setCurrentMissionIndex] = useState<number>(0);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [bankExhaustedNotice, setBankExhaustedNotice] = useState<boolean>(false);

  // Sync earned stamps count across rounds
  const rounds = loadAllRounds();
  let earnedStampsCount = 0;
  rounds.forEach((r) => {
    r.missions.forEach((m) => {
      if (r.progress[m.id]?.isPassed) {
        earnedStampsCount++;
      }
    });
  });

  const handleSelectTab = (tab: ActiveTab) => {
    setCurrentRound(getCurrentRound());
    setActiveTab(tab);
  };

  // Trigger "Play Another Round" with a new 5-sense mission set
  const handlePlayNextRound = async () => {
    try {
      // Call backend to generate or select new 5-sense missions
      const usedQuestionIds = rounds.flatMap((r) => r.missions.map((m) => m.questionId || m.id));
      const previousTopics = rounds.flatMap((r) => r.missions.map((m) => m.title));
      const res = await fetch('/api/generate-round', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roundNumber: rounds.length + 1,
          usedQuestionIds,
          previousQuestionIds: usedQuestionIds,
          previousTopics,
        }),
      });

      let customMissions = undefined;
      let backendExhausted = false;
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.missions) && data.missions.length === 5) {
          customMissions = data.missions;
        }
        if (data.isBankExhausted) {
          backendExhausted = true;
        }
      }

      const { round: freshRound, isBankExhausted } = createNewRound(customMissions);
      setCurrentRound(freshRound);
      setCurrentMissionIndex(0);
      setActiveTab('expedition');
      setRefreshTrigger((prev) => prev + 1);
      if (isBankExhausted || backendExhausted) {
        setBankExhaustedNotice(true);
      }
    } catch (e) {
      console.warn('Fallback to local preset pool for new round', e);
      const { round: freshRound, isBankExhausted } = createNewRound();
      setCurrentRound(freshRound);
      setCurrentMissionIndex(0);
      setActiveTab('expedition');
      setRefreshTrigger((prev) => prev + 1);
      if (isBankExhausted) {
        setBankExhaustedNotice(true);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-slate-800 flex flex-col selection:bg-amber-100 selection:text-amber-900">
      {/* Top Bar Header */}
      {activeTab !== 'home' && (
        <Header
          activeTab={activeTab as ActiveTab}
          onSelectTab={handleSelectTab}
          earnedStampsCount={earnedStampsCount}
          totalMissionsCount={5}
        />
      )}

      {/* Bank Exhausted Notice Toast */}
      {bankExhaustedNotice && (
        <div className="bg-[#007EA7] text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2 max-w-4xl mx-auto flex-1">
            <span className="text-base select-none">🧭</span>
            <span>
              太棒了！50 道五感海域題目已全部探索過至少一輪！系統已為你開啟全新循環巡航，隨時可以再次啟航！
            </span>
          </div>
          <button
            onClick={() => setBankExhaustedNotice(false)}
            className="text-white hover:text-sky-100 text-xs px-2 py-0.5 rounded cursor-pointer font-bold"
          >
            ✕ 關閉
          </button>
        </div>
      )}

      {/* Main View Container */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomeView
            onStartStudent={() => {
              const latest = getCurrentRound();
              setCurrentRound(latest);
              // If current round is already completed with settlement, go to settlement; else expedition
              if (latest.settlement) {
                setActiveTab('settlement');
              } else {
                setActiveTab('expedition');
              }
            }}
          />
        )}

        {activeTab === 'expedition' && (
          <StudentExpeditionView
            currentRound={currentRound}
            currentMissionIndex={currentMissionIndex}
            onSelectMissionIndex={(idx) => setCurrentMissionIndex(idx)}
            onEnterSettlement={() => {
              setCurrentRound(getCurrentRound());
              setActiveTab('settlement');
            }}
            onOpenStamps={() => setActiveTab('stamps')}
            onUpdateRound={(updatedRound) => setCurrentRound(updatedRound)}
          />
        )}

        {activeTab === 'settlement' && (
          <RoundSettlementView
            round={currentRound}
            onPlayNextRound={handlePlayNextRound}
            onOpenStamps={() => setActiveTab('stamps')}
          />
        )}

        {activeTab === 'stamps' && (
          <StampBookView
            onSelectMissionIndex={(idx) => {
              setCurrentMissionIndex(idx);
              setActiveTab('expedition');
            }}
          />
        )}

        {activeTab === 'dictionary' && (
          <DictionaryExplorerView missions={currentRound.missions} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white/50 py-4 text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>摹寫領航員 · 揚起五感風帆，一步一步把感受寫得更清楚</span>
          <span className="text-[11px] text-slate-400">
            國小三年級五感摹寫學習 · 視覺 · 聽覺 · 嗅覺 · 味覺 · 觸覺
          </span>
        </div>
      </footer>
    </div>
  );
}
