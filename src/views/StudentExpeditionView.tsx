/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  Send,
  HelpCircle,
  BookOpen,
  Award,
  RefreshCw,
  CheckCircle2,
  ChevronRight,
  Eye,
  AlertTriangle,
  History,
  LifeBuoy,
  Smile
} from 'lucide-react';
import { Mission, MissionProgress, AttemptRecord, RoundData, SENSORY_NAMES } from '../types/index.ts';
import { StarDisplay } from '../components/StarDisplay.tsx';
import { StampBadge } from '../components/StampBadge.tsx';
import { CriteriaModal } from '../components/CriteriaModal.tsx';
import { DictionaryModal } from '../components/DictionaryModal.tsx';
import { VersionComparison } from '../components/VersionComparison.tsx';
import { ImageContainer } from '../components/ImageContainer.tsx';
import {
  saveAttemptToRound,
  getRoundProgress,
  settleRound
} from '../utils/storage.ts';

interface StudentExpeditionViewProps {
  currentRound: RoundData;
  currentMissionIndex: number;
  onSelectMissionIndex: (index: number) => void;
  onEnterSettlement: () => void;
  onOpenStamps: () => void;
  onUpdateRound?: (round: RoundData) => void;
}

export const StudentExpeditionView: React.FC<StudentExpeditionViewProps> = ({
  currentRound,
  currentMissionIndex,
  onSelectMissionIndex,
  onEnterSettlement,
  onOpenStamps,
  onUpdateRound,
}) => {
  const missions = currentRound.missions;
  const currentMission = missions[currentMissionIndex] || missions[0];
  const sensoryInfo = SENSORY_NAMES[currentMission.sensoryType];

  const [sentenceInput, setSentenceInput] = useState('');
  const [progress, setProgress] = useState<MissionProgress>(() =>
    getRoundProgress(currentRound.roundId, currentMission.id)
  );
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals
  const [isCriteriaModalOpen, setIsCriteriaModalOpen] = useState(false);
  const [isDictionaryOpen, setIsDictionaryOpen] = useState(false);
  const [selectedAttemptForModal, setSelectedAttemptForModal] = useState<AttemptRecord | null>(null);

  // Scaffolding & Stuck tracker
  const [consecutiveStuckCount, setConsecutiveStuckCount] = useState(0);
  const [stuckHelpNotice, setStuckHelpNotice] = useState<string | null>(null);

  // Active version tab
  const [activeVersionIndex, setActiveVersionIndex] = useState<number>(-1);

  // Sync state when mission changes
  useEffect(() => {
    const p = getRoundProgress(currentRound.roundId, currentMission.id);
    setProgress(p);
    setErrorMessage(null);
    setStuckHelpNotice(null);
    setConsecutiveStuckCount(0);

    if (p.attempts.length > 0) {
      setActiveVersionIndex(p.attempts.length - 1);
      setSentenceInput(p.attempts[p.attempts.length - 1].studentSentence);
    } else {
      setActiveVersionIndex(-1);
      setSentenceInput('');
    }
  }, [currentMission.id, currentMission.imageUrl, currentRound.roundId]);

  const attempts = progress.attempts || [];
  const latestAttempt = attempts.length > 0 ? attempts[attempts.length - 1] : null;
  const currentViewingAttempt =
    activeVersionIndex >= 0 && activeVersionIndex < attempts.length
      ? attempts[activeVersionIndex]
      : latestAttempt;

  // Submit sentence for evaluation
  const handleSubmitSentence = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmed = sentenceInput.trim();
    if (!trimmed) {
      setErrorMessage('請先在下方格子裡，寫下一句你想表達的描寫句子喔！');
      return;
    }

    if (isEvaluating) return;

    setIsEvaluating(true);
    setErrorMessage(null);
    setStuckHelpNotice(null);

    let nextLevel: 1 | 2 | 3 | 4 = 1;
    if (latestAttempt && latestAttempt.totalScore < 4) {
      nextLevel = Math.min(4, latestAttempt.scaffoldLevel + 1) as any;
    }

    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          missionId: currentMission.id,
          missionTitle: currentMission.title,
          missionPrompt: currentMission.instruction,
          sensoryType: currentMission.sensoryType,
          sensoryGuide: currentMission.sensoryGuide,
          imageUrl: currentMission.imageUrl,
          imageAlt: currentMission.imageAlt,
          studentSentence: trimmed,
          previousAttempts: attempts.map((a) => ({
            version: a.version,
            sentence: a.studentSentence,
            teacherDiscovery: a.teacherDiscovery,
            thinkingGuide: a.thinkingGuide || a.nextQuestion,
            priority: a.priority,
            scaffoldLevel: a.scaffoldLevel,
            totalScore: a.totalScore,
          })),
          scaffoldLevel: nextLevel,
          unknownCount: consecutiveStuckCount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '評估小幫手正在休息，請再試一次！');
      }

      const evalResult = await response.json();

      const newVersionNum = attempts.length + 1;
      const label = newVersionNum === 1 ? '第一次寫作' : `第 ${newVersionNum} 次修改`;

      const newAttempt: AttemptRecord = {
        id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        roundId: currentRound.roundId,
        questionId: currentMission.questionId || currentMission.id,
        sense: currentMission.sensoryType,
        questionTitle: currentMission.title,
        submittedText: trimmed,
        submittedAt: new Date().toISOString(),
        version: newVersionNum,
        label,
        timestamp: new Date().toISOString(),
        studentSentence: trimmed,
        isCompleteSentence: evalResult.is_complete_sentence !== false,
        incompleteReason: evalResult.incomplete_reason || '',
        sensoryMatch: evalResult.sensory_match !== false,
        sensoryReason: evalResult.sensory_reason || '',
        teacherDiscovery: evalResult.teacher_discovery || '',
        thinkingGuide: evalResult.thinking_guide || evalResult.next_question || '',
        criteria: evalResult.criteria,
        totalScore: evalResult.total_score,
        comparisonType: evalResult.comparison_feedback?.type,
        comparisonTitle: evalResult.comparison_feedback?.title,
        comparisonContent: evalResult.comparison_feedback?.content,
        needsClarification: Boolean(evalResult.needs_clarification),
        clarificationQuestion: evalResult.clarification_question || null,
        strength: evalResult.strength,
        priority: evalResult.priority,
        feedback: evalResult.feedback,
        nextQuestion: evalResult.thinking_guide || evalResult.next_question,
        scaffoldLevel: evalResult.scaffold_level || nextLevel,
        isPassed: evalResult.total_score >= 4,
        isFullStars: evalResult.total_score === 5,
      };

      const updatedRound = saveAttemptToRound(
        currentRound.roundId,
        currentMission.id,
        newAttempt,
        newAttempt.isPassed,
        newAttempt.isFullStars
      );

      // Notify parent App component to synchronize round state
      onUpdateRound?.(updatedRound);

      const updatedProg = updatedRound.progress[currentMission.id];
      setProgress(updatedProg);
      setActiveVersionIndex(updatedProg.attempts.length - 1);

      if (evalResult.total_score < 3) {
        setConsecutiveStuckCount((prev) => prev + 1);
      } else {
        setConsecutiveStuckCount(0);
      }

      // If all 5 missions are passed, or the last mission in this round is passed, settle round
      const allPassed = missions.every(
        (m) => (m.id === currentMission.id ? newAttempt.isPassed : updatedRound.progress[m.id]?.isPassed)
      );

      if (allPassed || (currentMissionIndex === missions.length - 1 && newAttempt.isPassed)) {
        const stageSummaries = missions.map((m) => {
          const p = updatedRound.progress[m.id];
          const atts = p?.attempts || [];
          const lAtt = atts[atts.length - 1];
          const fAtt = atts[0];
          const hasFormal = atts.length > 0 && Boolean(lAtt?.studentSentence?.trim());
          const finalVerbatim = hasFormal ? lAtt.studentSentence : '本關尚無正式作答';

          return {
            missionId: m.id,
            questionId: m.questionId || m.id,
            sensoryType: m.sensoryType,
            sense: m.sensoryType,
            title: m.title,
            questionTitle: m.title,
            finalSentence: finalVerbatim,
            submittedText: hasFormal ? lAtt.studentSentence : undefined,
            submittedAt: lAtt?.timestamp,
            totalScore: lAtt?.totalScore || 0,
            sensoryMatch: lAtt ? (lAtt.sensoryMatch !== false) : false,
            sensoryReason: lAtt?.sensoryReason,
            hasFormalSubmission: hasFormal,
            attemptsCount: atts.length,
            isPassed: Boolean(p?.isPassed),
            isFullStars: Boolean(p?.isFullStars),
            stampIcon: p?.isFullStars ? m.fullStampIcon : m.stampIcon,
            stampName: p?.isFullStars ? m.fullStampName : m.stampName,
            firstSentence: atts.length > 1 ? fAtt?.studentSentence : undefined,
          };
        });

        settleRound(currentRound.roundId, '', stageSummaries);
        onUpdateRound?.(updatedRound);
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || '網路連線有點微弱，你的句子依然完整保留著，請直接再點一次送出！'
      );
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleOpenCriteriaModal = (attempt: AttemptRecord) => {
    setSelectedAttemptForModal(attempt);
    setIsCriteriaModalOpen(true);
  };

  const isLastStage = currentMissionIndex === missions.length - 1;
  const isAllFivePassed = missions.every(
    (m) => currentRound.progress[m.id]?.isPassed
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Five-Sense Step Progress Strip */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2.5">
          <span className="font-bold text-slate-800 flex items-center gap-1.5">
            <span className="text-sky-700 font-extrabold">第 {currentRound.roundNumber} 次出航</span>
            <span>· 五感海域航線地圖</span>
          </span>
          <span className="text-[11px] font-semibold text-slate-500">
            第 {currentMissionIndex + 1} / 5 個海域（依序領航探索）
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {missions.map((m, idx) => {
            const mProg = currentRound.progress[m.id] || { isPassed: false, isFullStars: false };
            const isCurrent = idx === currentMissionIndex;
            const isPassed = mProg.isPassed;
            const isFull = mProg.isFullStars;
            const sInfo = SENSORY_NAMES[m.sensoryType];

            // Enforce sequential unlock: previous stage must be passed or it's stage 1
            const isUnlocked = idx === 0 || Boolean(currentRound.progress[missions[idx - 1].id]?.isPassed);

            return (
              <button
                key={m.id}
                disabled={!isUnlocked}
                onClick={() => onSelectMissionIndex(idx)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-semibold transition-all border ${
                  isCurrent
                    ? 'bg-amber-500 text-white border-amber-600 shadow-xs scale-102'
                    : isPassed
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 cursor-pointer'
                    : isUnlocked
                    ? 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 cursor-pointer'
                    : 'bg-slate-100/60 text-slate-400 border-slate-200/60 cursor-not-allowed opacity-60'
                }`}
              >
                <div className="text-base select-none">{sInfo.icon}</div>
                <div className="text-[11px] font-bold mt-0.5 line-clamp-1">{sInfo.name}</div>
                <div className="text-[10px] opacity-80 line-clamp-1">{m.title}</div>
                {isFull ? (
                  <span className="text-[10px] text-amber-300 font-extrabold mt-0.5">★滿星</span>
                ) : isPassed ? (
                  <span className="text-[10px] text-emerald-600 font-bold mt-0.5">✓通關</span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workstation: 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (5 cols): Sensory Material Observation Stage */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                <span>{sensoryInfo.icon}</span>
                <span>第 {currentMissionIndex + 1} 關 · {sensoryInfo.name}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1.5">
                {currentMission.title}
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {currentMission.subtitle}
              </p>
            </div>

            {/* Auditory Situational Guidance (Text & Memory, No Audio Player, Open & Neutral) */}
            {currentMission.sensoryType === 'auditory' && (
              <div className="p-3.5 bg-sky-50/90 rounded-xl border border-sky-200 text-xs text-sky-950 font-medium leading-relaxed flex items-start gap-2.5 shadow-xs">
                <span className="text-base select-none mt-0.5">👂</span>
                <div>
                  <span className="font-bold text-sky-900 block mb-1">情境聽覺回想引導：</span>
                  <span>
                    請回想或想像：當你身處在這個情境時，耳朵聽到的聲音是什麼樣子的？請用自己的話，寫下一句描寫聲音特徵的句子。
                  </span>
                </div>
              </div>
            )}

            {/* Mission Image / Media with resilient loader, shimmer, auto-retry, and fallback */}
            <div className="relative group">
              <ImageContainer
                key={currentMission.id}
                src={currentMission.imageUrl}
                alt={currentMission.imageAlt}
                title={currentMission.title}
                sensoryType={currentMission.sensoryType}
                nextImageSrc={missions[currentMissionIndex + 1]?.imageUrl}
              />
              <div className="absolute bottom-2 left-2 right-2 bg-slate-900/65 backdrop-blur-xs text-white text-[11px] px-2.5 py-1.5 rounded-lg flex items-center justify-between pointer-events-none z-20">
                <span>
                  {currentMission.sensoryType === 'visual'
                    ? '仔細觀察照片外觀特徵'
                    : '情境輔助參考（請結合自身感官回憶）'}
                </span>
                <span className="text-slate-300 text-[10px]">無答案標籤</span>
              </div>
            </div>

            {/* Short clear prompt */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-medium">
              💡 {currentMission.instruction}
            </div>

            {/* Dictionary button (UNLOCKED ONLY AFTER 1st SUBMISSION) */}
            {attempts.length > 0 && (
              <button
                type="button"
                onClick={() => setIsDictionaryOpen(true)}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200 cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-amber-600" />
                <span>打開「五感詞語小百科」（思考小工具箱）</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column (7 cols): Writing & Guided Evaluation Stage */}
        <div className="lg:col-span-7 space-y-6">
          {/* Writing Input Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                {attempts.length === 0
                  ? `寫下你的【${sensoryInfo.name}】發現`
                  : '自己動手修改與升級句子'}
              </h3>
              {attempts.length > 0 && (
                <span className="text-xs text-slate-500">
                  即將進行第 {attempts.length + 1} 次修改
                </span>
              )}
            </div>

            <form onSubmit={handleSubmitSentence} className="space-y-4">
              <div className="relative">
                <textarea
                  rows={4}
                  value={sentenceInput}
                  onChange={(e) => setSentenceInput(e.target.value)}
                  disabled={isEvaluating}
                  placeholder={
                    attempts.length === 0
                      ? `專注於【${sensoryInfo.name}】，用一句話寫下你自己的真實感受...`
                      : '根據剛才的小建議，把你想調整或補充的字句寫在裡面...'
                  }
                  className="w-full text-base sm:text-lg p-4 rounded-xl border-2 border-slate-200 focus:border-amber-500 focus:outline-hidden transition-colors resize-none placeholder:text-slate-400 font-normal leading-relaxed text-slate-900 bg-slate-50/50 focus:bg-white"
                />
                <div className="text-right text-[11px] text-slate-400 mt-1">
                  字數：{sentenceInput.trim().length} 字
                </div>
              </div>

              {/* Error banner */}
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">提醒：</span>
                    {errorMessage}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-1 gap-3">
                <div className="text-xs text-slate-500">
                  {isEvaluating
                    ? '小老師正在仔細閱讀你的句子...'
                    : '句子由你決定，AI 提供引導與回饋'}
                </div>

                <button
                  type="submit"
                  disabled={isEvaluating || !sentenceInput.trim()}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all whitespace-nowrap shadow-xs cursor-pointer ${
                    isEvaluating || !sentenceInput.trim()
                      ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                      : 'bg-amber-500 hover:bg-amber-600 active:scale-98 shadow-amber-200'
                  }`}
                >
                  {isEvaluating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>正在評估中...</span>
                    </>
                  ) : (
                    <>
                      <span>{attempts.length === 0 ? '送出我的句子' : '完成修改並送出'}</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Current Evaluation & Scaffolding Feedback Box */}
          {currentViewingAttempt && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5 animate-in fade-in duration-300">
              {/* Star header & Status */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">
                      {currentViewingAttempt.label} 評估結果：
                    </span>
                    {currentViewingAttempt.isFullStars ? (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                        🌟 滿星成就！
                      </span>
                    ) : currentViewingAttempt.isPassed ? (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                        🎉 通關成功！
                      </span>
                    ) : (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        一步步升級中
                      </span>
                    )}
                  </div>
                  <StarDisplay score={currentViewingAttempt.totalScore} size="lg" />
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenCriteriaModal(currentViewingAttempt)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                  <span>查看完整指標說明</span>
                </button>
              </div>

              {/* Five Criteria Breakdown (Directly visible score & reason) */}
              {currentViewingAttempt.criteria && currentViewingAttempt.criteria.length > 0 && currentViewingAttempt.totalScore > 0 && (
                <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/90 space-y-2">
                  <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>五項摹寫標準評分詳情：</span>
                    <span className="text-slate-500 font-normal text-[11px]">得 {currentViewingAttempt.totalScore} / 5 分</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {currentViewingAttempt.criteria.map((c) => (
                      <div
                        key={c.id}
                        className={`p-2 rounded-lg border flex items-start gap-2 ${
                          c.score === 1
                            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                            : 'bg-slate-100/70 border-slate-200 text-slate-600'
                        }`}
                      >
                        <span className={`font-bold shrink-0 mt-0.5 ${c.score === 1 ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {c.score === 1 ? '✓' : '✗'}
                        </span>
                        <div className="min-w-0">
                          <div className="font-semibold flex items-center gap-1.5">
                            <span>{c.name}</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                              c.score === 1 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                            }`}>
                              {c.score}分
                            </span>
                          </div>
                          <p className="text-[11px] mt-0.5 leading-snug">
                            {c.reason}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pass / Mastery Banner */}
              {currentViewingAttempt.isFullStars ? (
                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-300 text-amber-900 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-base font-bold flex items-center gap-2">
                      <span>🌟 五顆星！榮獲滿星金牌領航員成就！</span>
                    </div>
                    <p className="text-xs text-amber-800">
                      {attempts.length === 1
                        ? '你一開始就寫得很完整！榮獲滿星領航圖章。'
                        : '你已經把感官特徵與細節表達得很完整，不需再強求修改，帶著這枚圖章繼續前進！'}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <StampBadge
                      name={currentMission.fullStampName}
                      icon={currentMission.fullStampIcon}
                      isFullStar
                      size="sm"
                    />
                  </div>
                </div>
              ) : currentViewingAttempt.isPassed ? (
                <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-300 text-emerald-900 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-base font-bold flex items-center gap-2">
                      <span>🎉 成功通關！獲得海域領航圖章！</span>
                    </div>
                    <p className="text-xs text-emerald-800">
                      成功獲得通關圖章！你可以直接前進下一處海域，或自願挑戰更豐富的細節。
                    </p>
                  </div>
                  <div className="shrink-0">
                    <StampBadge
                      name={currentMission.stampName}
                      icon={currentMission.stampIcon}
                      size="sm"
                    />
                  </div>
                </div>
              ) : null}

              {/* Zero-score display (0 / 5 stars): Incomplete sentence or sensory mismatch or no feature */}
              {currentViewingAttempt.totalScore === 0 && (
                <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-xl text-rose-950 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-rose-800 text-sm">
                      <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                      <span>評分：0／5 分</span>
                    </div>
                    <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                      未通關
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-rose-900 leading-relaxed font-semibold">
                    {currentViewingAttempt.isCompleteSentence === false
                      ? (currentViewingAttempt.incompleteReason?.startsWith('評分原因：')
                          ? currentViewingAttempt.incompleteReason
                          : `評分原因：${currentViewingAttempt.incompleteReason || '這是一個片語，尚未形成完整的句子。'}`)
                      : !currentViewingAttempt.sensoryMatch
                      ? (currentViewingAttempt.sensoryReason?.startsWith('評分原因：')
                          ? currentViewingAttempt.sensoryReason
                          : `評分原因：${currentViewingAttempt.sensoryReason || `這個句子主要描述其他內容，未實際描寫【${sensoryInfo.name}】。`}`)
                      : '評分原因：尚未描寫出具體的感官特徵。'}
                  </p>
                </div>
              )}

              {/* Clarification Notice if triggered */}
              {currentViewingAttempt.needsClarification &&
                currentViewingAttempt.clarificationQuestion && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1.5">
                    <div className="font-bold text-blue-800 flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-blue-600" />
                      小老師想先跟你確認一下：
                    </div>
                    <p className="text-sm text-blue-950 font-medium">
                      「{currentViewingAttempt.clarificationQuestion}」
                    </p>
                  </div>
                )}

              {/* Teacher Discovery: Quotes Student's Verbatim Sentence */}
              {currentViewingAttempt.teacherDiscovery && currentViewingAttempt.totalScore > 0 && (
                <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-300/80 space-y-1.5 text-xs text-amber-950">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5 text-sm">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>小老師發現：</span>
                  </div>
                  <p className="text-sm text-slate-800 font-medium leading-relaxed">
                    {currentViewingAttempt.teacherDiscovery}
                  </p>
                </div>
              )}

              {/* Unpassed with 1~3 stars: 1 Concrete Priority Focus + 1 Scaffolded Guiding Question */}
              {currentViewingAttempt.totalScore >= 1 && !currentViewingAttempt.isPassed && (
                <div className="space-y-4">
                  {currentViewingAttempt.priority && (
                    <div className="p-4 bg-amber-50/90 rounded-2xl border border-amber-300 text-xs text-amber-950 space-y-1 shadow-xs">
                      <div className="font-bold text-amber-900 flex items-center gap-1.5 text-xs">
                        <span>🎯 最值得優先調整的方向：</span>
                      </div>
                      <p className="text-sm text-slate-800 font-medium leading-relaxed">
                        {currentViewingAttempt.priority}
                      </p>
                    </div>
                  )}

                  {/* Thinking Guide: Dynamic Progressive Question */}
                  {(currentViewingAttempt.thinkingGuide || currentViewingAttempt.nextQuestion) && (
                    <div className="p-5 bg-slate-900 text-white rounded-2xl shadow-sm space-y-2.5">
                      <div className="text-xs text-amber-300 font-bold flex flex-wrap items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>思考引導（第 {currentViewingAttempt.scaffoldLevel || 1} 階段）：</span>
                        </span>
                        <span className="text-[11px] text-amber-200 bg-slate-800/90 border border-slate-700 px-2.5 py-0.5 rounded-full font-semibold">
                          {currentViewingAttempt.scaffoldLevel === 1 && '第一階段：找出原因'}
                          {currentViewingAttempt.scaffoldLevel === 2 && '第二階段：聚焦具體對象或特徵'}
                          {currentViewingAttempt.scaffoldLevel === 3 && '第三階段：協助找到適當描述方式'}
                          {currentViewingAttempt.scaffoldLevel === 4 && '第四階段：引導自行修改句子'}
                        </span>
                      </div>
                      <p className="text-sm font-semibold leading-relaxed text-slate-100">
                        {currentViewingAttempt.thinkingGuide || currentViewingAttempt.nextQuestion}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Anti-stalling Supportive Options for unpassed states */}
              {!currentViewingAttempt.isPassed && (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <LifeBuoy className="w-3.5 h-3.5 text-slate-500" />
                      想換個靈感或休息一下？
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSentenceInput('');
                          setStuckHelpNotice(
                            `沒關係！深呼吸一下，重新想一想【${sensoryInfo.name}】，最明顯的一點感覺是什麼。`
                          );
                        }}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 rounded-md border border-slate-200 text-slate-700 cursor-pointer"
                      >
                        重新感受一次
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setStuckHelpNotice(
                            '太棒了！寫作需要適度休息。伸展雙手、喝一口水，等一下再回來繼續探險！'
                          );
                        }}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 rounded-md border border-slate-200 text-slate-700 cursor-pointer"
                      >
                        休息一下
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setStuckHelpNotice(
                            '你可以把句子大聲唸給自己聽聽看，或是打開詞語小百科尋找靈感喔！'
                          );
                        }}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 rounded-md border border-blue-200 text-blue-800 font-semibold cursor-pointer"
                      >
                        朗讀給自己聽
                      </button>
                    </div>
                  </div>

                  {stuckHelpNotice && (
                    <div className="p-3 bg-blue-50/80 border border-blue-200 text-xs text-blue-900 rounded-xl animate-in fade-in">
                      {stuckHelpNotice}
                    </div>
                  )}
                </div>
              )}

              {/* Consecutive Attempt Comparison */}
              {attempts.length > 1 && (
                <VersionComparison
                  previousAttempt={
                    activeVersionIndex > 0
                      ? attempts[activeVersionIndex - 1]
                      : attempts[attempts.length - 2]
                  }
                  latestAttempt={currentViewingAttempt}
                />
              )}

              {/* Navigation to Next Stage OR Round Settlement */}
              {progress.isPassed && (
                <div className="pt-2 flex justify-end">
                  {isLastStage ? (
                    <button
                      type="button"
                      onClick={onEnterSettlement}
                      className="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-amber-300 transition-all active:scale-98 cursor-pointer"
                    >
                      <Sparkles className="w-5 h-5 text-amber-200" />
                      <span>完成五大海域！前往領航總結算</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onSelectMissionIndex(currentMissionIndex + 1)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-200 transition-all active:scale-98 cursor-pointer"
                    >
                      <span>啟航前往下一海域（{SENSORY_NAMES[missions[currentMissionIndex + 1].sensoryType].name}）</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Version History Tabs Strip */}
          {attempts.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold flex items-center gap-1.5 text-slate-700">
                  <History className="w-4 h-4 text-slate-500" />
                  修改歷程紀錄（點擊檢視各版本）
                </span>
                <span>共 {attempts.length} 個版本</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {attempts.map((att, idx) => (
                  <button
                    key={att.id}
                    onClick={() => setActiveVersionIndex(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 border cursor-pointer ${
                      activeVersionIndex === idx
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{att.label}</span>
                    <span className="text-[11px] opacity-80 tabular-nums">
                      ({att.totalScore}★)
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedAttemptForModal && (
        <CriteriaModal
          isOpen={isCriteriaModalOpen}
          onClose={() => setIsCriteriaModalOpen(false)}
          criteria={selectedAttemptForModal.criteria}
          studentSentence={selectedAttemptForModal.studentSentence}
          totalScore={selectedAttemptForModal.totalScore}
        />
      )}

      <DictionaryModal
        isOpen={isDictionaryOpen}
        onClose={() => setIsDictionaryOpen(false)}
        mission={currentMission}
      />
    </div>
  );
};
