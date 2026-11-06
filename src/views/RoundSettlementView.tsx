/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Sparkles,
  Award,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  BookOpen,
  ArrowRight,
  Layers,
  Heart
} from 'lucide-react';
import { RoundData, SENSORY_NAMES, StageSettlementSummary } from '../types/index.ts';
import { StarDisplay } from '../components/StarDisplay.tsx';
import { StampBadge } from '../components/StampBadge.tsx';
import { getRoundById } from '../utils/storage.ts';

interface RoundSettlementViewProps {
  round: RoundData;
  onPlayNextRound: () => void;
  onOpenStamps: () => void;
}

export const RoundSettlementView: React.FC<RoundSettlementViewProps> = ({
  round,
  onPlayNextRound,
  onOpenStamps,
}) => {
  // Always query freshest round data from storage to avoid any stale props
  const currentFreshRound = getRoundById(round.roundId) || round;
  const settlement = currentFreshRound.settlement;
  const missions = currentFreshRound.missions;

  // Calculate settlement stats directly from round data
  const stageSummaries: StageSettlementSummary[] = missions.map((m) => {
    const prog = currentFreshRound.progress[m.id];
    const attempts = prog?.attempts || [];
    const latestAttempt = attempts[attempts.length - 1];
    const firstAttempt = attempts[0];
    const latestText = latestAttempt?.submittedText || latestAttempt?.studentSentence;
    const firstText = firstAttempt?.submittedText || firstAttempt?.studentSentence;
    const hasFormal = attempts.length > 0 && Boolean(latestText?.trim());

    return {
      missionId: m.id,
      questionId: m.questionId || m.id,
      sensoryType: m.sensoryType,
      sense: m.sensoryType,
      title: m.title,
      questionTitle: m.title,
      finalSentence: hasFormal ? latestText : '本關尚無正式作答',
      submittedText: hasFormal ? latestText : undefined,
      submittedAt: latestAttempt?.timestamp,
      totalScore: hasFormal ? (latestAttempt.sensoryMatch === false ? 0 : latestAttempt.totalScore) : 0,
      sensoryMatch: hasFormal ? (latestAttempt.sensoryMatch !== false) : false,
      sensoryReason: latestAttempt?.sensoryReason,
      hasFormalSubmission: hasFormal,
      attemptsCount: attempts.length,
      isPassed: Boolean(prog?.isPassed),
      isFullStars: Boolean(prog?.isFullStars),
      stampIcon: prog?.isFullStars ? m.fullStampIcon : m.stampIcon,
      stampName: prog?.isFullStars ? m.fullStampName : m.stampName,
      firstSentence: hasFormal && firstAttempt && attempts.length > 1 ? firstText : undefined,
    };
  });

  const totalStars = stageSummaries.reduce((sum, s) => sum + s.totalScore, 0);
  const fullStarsCount = stageSummaries.filter((s) => s.isFullStars).length;
  const passedCount = stageSummaries.filter((s) => s.isPassed).length;

  // Generate authentic, individualized review
  const generatePersonalizedReview = () => {
    const praises: string[] = [];
    if (fullStarsCount >= 3) {
      praises.push(`你在本輪中榮獲了 ${fullStarsCount} 關的滿星大師成就，展現了敏銳深刻的五感觀察力！`);
    } else if (passedCount === 5) {
      praises.push('太厲害了！你順利克服了視覺、聽覺、嗅覺、味覺、觸覺全部五道難關，順利通關！');
    }

    const revisedStages = stageSummaries.filter((s) => s.attemptsCount > 1);
    if (revisedStages.length > 0) {
      praises.push(
        `在【${revisedStages.map((s) => SENSORY_NAMES[s.sensoryType].name).join('、')}】中，你根據思考引導耐心地自己動手修改，字句變得更加豐富生動，看見了你持續進步的堅持！`
      );
    }

    const firstTryPassed = stageSummaries.filter((s) => s.attemptsCount === 1 && s.isPassed);
    if (firstTryPassed.length > 0) {
      praises.push(
        `在【${firstTryPassed.map((s) => SENSORY_NAMES[s.sensoryType].name).join('、')}】中，你一開始就觀察得非常到位，一次就達成精彩的描寫！`
      );
    }

    return praises.join(' ');
  };

  const reviewText = settlement?.overallFeedback || generatePersonalizedReview();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-500">
      {/* Grand Celebration Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B2545] via-[#134074] to-[#007EA7] text-white p-8 sm:p-10 shadow-xl shadow-sky-950/20 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-bold tracking-wide">
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <span>第 {round.roundNumber} 次出航 · 五感海域領航總結算</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display">
          順利返航！完成本輪五感海域摹寫探索！
        </h1>
        <p className="text-sm sm:text-base text-sky-100 max-w-2xl mx-auto leading-relaxed">
          你成功跨越了視覺、聽覺、嗅覺、味覺與觸覺的五大海域，一步一步用自己的語言把感受寫得更清楚！
        </p>

        {/* Milestone Statistics Strip */}
        <div className="pt-4 grid grid-cols-3 gap-3 max-w-lg mx-auto">
          <div className="bg-white/15 backdrop-blur-xs rounded-2xl p-3 border border-white/20">
            <div className="text-2xl sm:text-3xl font-black tabular-nums">{totalStars}</div>
            <div className="text-[11px] text-amber-100 mt-0.5">累積星數 / 25★</div>
          </div>
          <div className="bg-white/15 backdrop-blur-xs rounded-2xl p-3 border border-white/20">
            <div className="text-2xl sm:text-3xl font-black text-amber-200 tabular-nums">
              {fullStarsCount}
            </div>
            <div className="text-[11px] text-amber-100 mt-0.5">滿星關卡 / 5關</div>
          </div>
          <div className="bg-white/15 backdrop-blur-xs rounded-2xl p-3 border border-white/20">
            <div className="text-2xl sm:text-3xl font-black text-emerald-200 tabular-nums">
              {passedCount}
            </div>
            <div className="text-[11px] text-amber-100 mt-0.5">成功通關 / 5關</div>
          </div>
        </div>
      </div>

      {/* Tailored Authentic Overall Review */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-2">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
          <span>小老師為你整理的本輪成長足跡</span>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed font-normal bg-amber-50/60 p-4 rounded-xl border border-amber-200/70">
          {reviewText}
        </p>
      </div>

      {/* Five Senses Showcase Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-500" />
            <span>五感作品巡禮（第 {round.roundNumber} 輪完整成果）</span>
          </h3>
          <span className="text-xs text-slate-500">依序完成 5 種感官</span>
        </div>

        <div className="space-y-4">
          {stageSummaries.map((stage, idx) => {
            const sensory = SENSORY_NAMES[stage.sensoryType];
            const hasRevised = Boolean(stage.firstSentence);

            return (
              <div
                key={stage.missionId}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{sensory.icon}</span>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        關卡 {idx + 1}：{sensory.name} · {stage.title}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {!stage.hasFormalSubmission
                          ? '尚無作答紀錄'
                          : stage.attemptsCount === 1
                          ? '一回達成'
                          : `經過 ${stage.attemptsCount} 次修改升級`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {/* Sensory Match Indicator */}
                    {stage.hasFormalSubmission && (
                      stage.sensoryMatch ? (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ✓ 符合【{sensory.name}】
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                          ✗ 未符合【{sensory.name}】(0★)
                        </span>
                      )
                    )}

                    <StarDisplay score={stage.totalScore} size="sm" />

                    {!stage.hasFormalSubmission ? (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                        未作答
                      </span>
                    ) : stage.isFullStars ? (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                        滿星成就
                      </span>
                    ) : stage.isPassed ? (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        通關
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        未達通關
                      </span>
                    )}
                  </div>
                </div>

                {/* Sentences - Exact Student Text Verbatim */}
                {!stage.hasFormalSubmission ? (
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400 italic">
                    本關尚無正式作答
                  </div>
                ) : hasRevised ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <span className="font-semibold text-slate-500">第一次寫作：</span>
                      <p className="text-slate-700 leading-relaxed font-normal">「{stage.firstSentence}」</p>
                    </div>
                    <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-1">
                      <span className="font-bold text-emerald-800">最後送出版本（原始學生句子）：</span>
                      <p className="text-slate-900 font-semibold leading-relaxed">「{stage.finalSentence}」</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 bg-emerald-50/40 rounded-xl border border-emerald-200/80 space-y-1 text-xs">
                    <span className="font-bold text-emerald-800">最後送出版本（原始學生句子）：</span>
                    <p className="text-sm font-medium text-slate-900 leading-relaxed">「{stage.finalSentence}」</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Navigation Footer */}
      <div className="p-6 bg-slate-100 rounded-3xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={onOpenStamps}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition-colors shadow-xs cursor-pointer"
        >
          <Award className="w-4 h-4 text-amber-500" />
          <span>查看我的航海印章簿</span>
        </button>

        <button
          type="button"
          onClick={onPlayNextRound}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-bold text-white bg-[#007EA7] hover:bg-[#006488] rounded-xl shadow-md shadow-sky-200 transition-all active:scale-98 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>再次啟航（探索全新五感海域題目！）</span>
        </button>
      </div>
    </div>
  );
};
