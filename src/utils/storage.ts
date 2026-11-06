/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Mission,
  MissionProgress,
  AttemptRecord,
  RoundData,
  RoundSettlement,
  StageSettlementSummary,
} from '../types/index.ts';
import { ROUND_PRESET_SETS, DEFAULT_MISSIONS, generateRoundMissions, QUESTION_BANK } from '../data/defaultMissions.ts';

const ROUNDS_KEY = 'moxie_rounds_v2';
const ACTIVE_ROUND_ID_KEY = 'moxie_active_round_id_v2';
const CUSTOM_MISSIONS_KEY = 'moxie_custom_missions_v2';

export const STORAGE_DISCLAIMER = {
  scope: '本機瀏覽器（localStorage）',
  explanation:
    '你的五感關卡紀錄、各輪結算足跡、通關印章與句子修改歷程均保存在當前電腦／平板之瀏覽器內部儲存空間。不會上傳至外部伺服器，守護你的隱私。',
  persistence:
    '除非主動清理瀏覽器快取紀錄，否則你的學習日誌會持續保留在此裝置中，換輪遊玩不會刪除舊輪次紀錄。',
};

// Initialize or load all rounds
export function loadAllRounds(): RoundData[] {
  try {
    const raw = localStorage.getItem(ROUNDS_KEY);
    if (!raw) {
      // First time initialization: Create Round 1
      const initialRound: RoundData = {
        roundId: 'round_1',
        roundNumber: 1,
        createdAt: new Date().toISOString(),
        missions: ROUND_PRESET_SETS[0],
        progress: {},
      };
      // initialize progress for each mission
      initialRound.missions.forEach((m) => {
        initialRound.progress[m.id] = {
          missionId: m.id,
          attempts: [],
          isPassed: false,
          isFullStars: false,
        };
      });
      localStorage.setItem(ROUNDS_KEY, JSON.stringify([initialRound]));
      localStorage.setItem(ACTIVE_ROUND_ID_KEY, initialRound.roundId);
      return [initialRound];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Sync missions metadata with clean QUESTION_BANK definitions
      return parsed.map((r: RoundData) => ({
        ...r,
        missions: r.missions.map((m) => {
          const fresh = QUESTION_BANK.find((q) => q.id === m.id || q.questionId === m.id);
          if (fresh) {
            return {
              ...m,
              title: fresh.title,
              subtitle: fresh.subtitle,
              instruction: fresh.instruction,
              sensoryGuide: '',
              imageAlt: fresh.imageAlt,
            };
          }
          return { ...m, sensoryGuide: '' };
        }),
      }));
    }
    return [];
  } catch (e) {
    console.error('Failed to load rounds from storage', e);
    return [];
  }
}

export function saveAllRounds(rounds: RoundData[]): void {
  try {
    localStorage.setItem(ROUNDS_KEY, JSON.stringify(rounds));
  } catch (e) {
    console.error('Failed to save rounds', e);
  }
}

export function getActiveRoundId(): string {
  let id = localStorage.getItem(ACTIVE_ROUND_ID_KEY);
  if (!id) {
    const rounds = loadAllRounds();
    id = rounds[rounds.length - 1]?.roundId || 'round_1';
    localStorage.setItem(ACTIVE_ROUND_ID_KEY, id);
  }
  return id;
}

export function setActiveRoundId(roundId: string): void {
  localStorage.setItem(ACTIVE_ROUND_ID_KEY, roundId);
}

export function getCurrentRound(): RoundData {
  const rounds = loadAllRounds();
  const activeId = getActiveRoundId();
  let found = rounds.find((r) => r.roundId === activeId);
  if (!found) {
    found = rounds[rounds.length - 1];
    if (found) {
      setActiveRoundId(found.roundId);
    }
  }
  return found || rounds[0];
}

export function getRoundProgress(roundId: string, missionId: string): MissionProgress {
  const rounds = loadAllRounds();
  const r = rounds.find((item) => item.roundId === roundId);
  if (!r) {
    return { missionId, attempts: [], isPassed: false, isFullStars: false };
  }
  return (
    r.progress[missionId] || {
      missionId,
      attempts: [],
      isPassed: false,
      isFullStars: false,
    }
  );
}

export function getRoundById(roundId: string): RoundData | undefined {
  const rounds = loadAllRounds();
  return rounds.find((r) => r.roundId === roundId);
}

export function saveAttemptToRound(
  roundId: string,
  missionId: string,
  newAttempt: AttemptRecord,
  isPassed: boolean,
  isFullStars: boolean
): RoundData {
  const rounds = loadAllRounds();
  const targetRoundIndex = rounds.findIndex((r) => r.roundId === roundId);
  if (targetRoundIndex === -1) {
    throw new Error('找不到指定輪次');
  }

  const round = rounds[targetRoundIndex];
  const curProg = round.progress[missionId] || {
    missionId,
    attempts: [],
    isPassed: false,
    isFullStars: false,
  };

  const mission = round.missions.find((m) => m.id === missionId);

  // Guarantee all required fields are preserved in the attempt record
  const enrichedAttempt: AttemptRecord = {
    ...newAttempt,
    roundId,
    questionId: newAttempt.questionId || mission?.questionId || missionId,
    sense: newAttempt.sense || mission?.sensoryType,
    questionTitle: newAttempt.questionTitle || mission?.title,
    submittedText: newAttempt.submittedText || newAttempt.studentSentence,
    submittedAt: newAttempt.submittedAt || newAttempt.timestamp,
  };

  const hasPassed = curProg.isPassed || isPassed;
  const hasFull = curProg.isFullStars || isFullStars;

  const updatedProgress: MissionProgress = {
    ...curProg,
    attempts: [...curProg.attempts, enrichedAttempt],
    isPassed: hasPassed,
    isFullStars: hasFull,
    passedAt: hasPassed ? curProg.passedAt || new Date().toISOString() : undefined,
  };

  round.progress[missionId] = updatedProgress;
  rounds[targetRoundIndex] = { ...round };
  saveAllRounds(rounds);
  return rounds[targetRoundIndex];
}

// Settle round when 5th stage finishes
export function settleRound(
  roundId: string,
  overallFeedback: string,
  stageSummaries: StageSettlementSummary[]
): RoundSettlement {
  const rounds = loadAllRounds();
  const targetRoundIndex = rounds.findIndex((r) => r.roundId === roundId);
  if (targetRoundIndex === -1) {
    throw new Error('找不到指定輪次進行結算');
  }

  const round = rounds[targetRoundIndex];

  // Enrich summaries with questionId, sense, questionTitle, submittedText, submittedAt
  const enrichedSummaries: StageSettlementSummary[] = stageSummaries.map((s) => {
    const mission = round.missions.find((m) => m.id === s.missionId);
    const prog = round.progress[s.missionId];
    const latestAttempt = prog?.attempts[prog.attempts.length - 1];
    const verbatimSentence = latestAttempt?.studentSentence?.trim() || latestAttempt?.submittedText?.trim() || s.finalSentence;

    return {
      ...s,
      questionId: s.questionId || mission?.questionId || mission?.id,
      sense: s.sense || s.sensoryType,
      questionTitle: s.questionTitle || s.title,
      finalSentence: verbatimSentence || (s.hasFormalSubmission ? verbatimSentence : '本關尚無正式作答'),
      submittedText: verbatimSentence,
      submittedAt: latestAttempt?.submittedAt || latestAttempt?.timestamp,
      sensoryMatch: latestAttempt ? (latestAttempt.sensoryMatch !== false) : s.sensoryMatch,
      totalScore: latestAttempt ? latestAttempt.totalScore : s.totalScore,
    };
  });

  const totalStars = enrichedSummaries.reduce((sum, s) => sum + s.totalScore, 0);
  const fullStarsCount = enrichedSummaries.filter((s) => s.isFullStars).length;
  const passedCount = enrichedSummaries.filter((s) => s.isPassed).length;

  const settlement: RoundSettlement = {
    roundId,
    roundNumber: round.roundNumber,
    settledAt: new Date().toISOString(),
    totalStars,
    fullStarsCount,
    passedCount,
    overallFeedback,
    stageSummaries: enrichedSummaries,
  };

  round.settlement = settlement;
  round.completedAt = settlement.settledAt;
  rounds[targetRoundIndex] = round;
  saveAllRounds(rounds);
  return settlement;
}

// Start a fresh new round with new 5 sensory missions
export function createNewRound(customMissions?: Mission[]): { round: RoundData; isBankExhausted: boolean } {
  const rounds = loadAllRounds();
  const nextRoundNumber = rounds.length + 1;
  const newRoundId = `round_${nextRoundNumber}_${Date.now()}`;

  // Collect all question IDs already used by this student in previous rounds
  const usedQuestionIds = rounds.flatMap((r) =>
    r.missions.map((m) => m.questionId || m.id)
  );

  let missionsToUse: Mission[] = [];
  let isBankExhausted = false;

  if (customMissions && customMissions.length === 5) {
    missionsToUse = customMissions;
  } else {
    // Generate from the 50-question bank without repetition
    const res = generateRoundMissions(usedQuestionIds, nextRoundNumber);
    if (res.isBankExhausted) {
      isBankExhausted = true;
      // If bank exhausted, cycle through preset rounds
      const poolIndex = (nextRoundNumber - 1) % ROUND_PRESET_SETS.length;
      missionsToUse = ROUND_PRESET_SETS[poolIndex];
    } else {
      missionsToUse = res.missions;
    }
  }

  // Prefix IDs to ensure unique keys in storage while preserving questionId
  const formattedMissions = missionsToUse.map((m, idx) => {
    const originalQId = m.questionId || m.id;
    return {
      ...m,
      questionId: originalQId,
      id: `r${nextRoundNumber}_s${idx + 1}_${originalQId}`,
    };
  });

  const newRound: RoundData = {
    roundId: newRoundId,
    roundNumber: nextRoundNumber,
    createdAt: new Date().toISOString(),
    missions: formattedMissions,
    progress: {},
  };

  formattedMissions.forEach((m) => {
    newRound.progress[m.id] = {
      missionId: m.id,
      attempts: [],
      isPassed: false,
      isFullStars: false,
    };
  });

  rounds.push(newRound);
  saveAllRounds(rounds);
  setActiveRoundId(newRoundId);
  return { round: newRound, isBankExhausted };
}


export function exportFullData(): string {
  const data = {
    exportDate: new Date().toISOString(),
    storageScope: STORAGE_DISCLAIMER.scope,
    explanation: STORAGE_DISCLAIMER.explanation,
    activeRoundId: getActiveRoundId(),
    rounds: loadAllRounds(),
  };
  return JSON.stringify(data, null, 2);
}

export function clearAllLocalProgress(): void {
  localStorage.removeItem(ROUNDS_KEY);
  localStorage.removeItem(ACTIVE_ROUND_ID_KEY);
  localStorage.removeItem(CUSTOM_MISSIONS_KEY);
}
