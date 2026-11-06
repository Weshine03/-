/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SensoryType = 'visual' | 'auditory' | 'olfactory' | 'gustatory' | 'tactile';

export const SENSORY_NAMES: Record<SensoryType, { name: string; icon: string; focus: string; seaZone: string }> = {
  visual: { name: '視覺觀察', icon: '👀', focus: '觀察外觀、顏色、形狀、大小或光影特徵', seaZone: '視覺海域' },
  auditory: { name: '聽覺觀察', icon: '👂', focus: '感受聲音的大小、高低、節奏、變化或情境', seaZone: '聽覺海域' },
  olfactory: { name: '嗅覺觀察', icon: '👃', focus: '感受聞到的氣味、氣味的變化及與情境的關係', seaZone: '嗅覺海域' },
  gustatory: { name: '味覺觀察', icon: '👅', focus: '品嚐食物的味道與口感，體會滋味變化', seaZone: '味覺海域' },
  tactile: { name: '觸覺觀察', icon: '✋', focus: '感受觸碰時物體表面質地、溫度或接觸感受', seaZone: '觸覺海域' },
};

export interface CriterionResult {
  id: 'subject' | 'feature' | 'word_choice' | 'detail' | 'vividness';
  name: string;
  score: 0 | 1;
  evidence: string | null;
  reason: string;
}

export interface ComparisonFeedback {
  type: 'progress' | 'encourage' | null;
  title: string;
  content: string;
  previousScore?: number;
  currentScore?: number;
}

export interface EvaluationResponse {
  is_complete_sentence: boolean;
  incomplete_reason?: string | null;
  criteria: CriterionResult[];
  total_score: number;
  sensory_match: boolean;
  sensory_reason: string;
  actual_sense_detected?: string | null;
  teacher_discovery: string;
  thinking_guide: string | null;
  needs_clarification: boolean;
  clarification_question: string | null;
  strength?: string;
  priority: string | null;
  feedback: string;
  next_question: string | null;
  scaffold_level: 1 | 2 | 3 | 4;
  comparison_feedback?: ComparisonFeedback | null;
}

export interface AttemptRecord {
  id: string;
  roundId?: string;
  questionId?: string;
  sense?: SensoryType;
  questionTitle?: string;
  submittedText?: string;
  submittedAt?: string;
  version: number;
  label: string; // '第一次寫作', '第 2 次修改', ...
  timestamp: string;
  studentSentence: string;
  isCompleteSentence: boolean;
  incompleteReason?: string | null;
  sensoryMatch: boolean;
  sensoryReason: string;
  teacherDiscovery: string;
  thinkingGuide: string;
  criteria: CriterionResult[];
  totalScore: number;
  needsClarification: boolean;
  clarificationQuestion: string | null;
  strength?: string;
  priority: string | null;
  feedback: string;
  nextQuestion: string | null;
  scaffoldLevel: 1 | 2 | 3 | 4;
  isPassed: boolean;
  isFullStars: boolean;
  comparisonType?: 'progress' | 'encourage' | null;
  comparisonTitle?: string;
  comparisonContent?: string;
}

export interface Mission {
  id: string;
  questionId?: string;
  sensoryType: SensoryType;
  sense?: SensoryType;
  title: string;
  subtitle: string;
  instruction: string;
  sensoryGuide: string;
  materialType: 'image' | 'audio' | 'recollection' | 'situational';
  audioSoundType?: 'rain' | 'bell' | 'wind' | 'bird' | 'water_kettle';
  imageUrl: string;
  imageAlt: string;
  stampName: string;
  stampIcon: string;
  fullStampName: string;
  fullStampIcon: string;
  dictionaryCategories: {
    category: string;
    words: string[];
    hint: string;
  }[];
}

export interface MissionProgress {
  missionId: string;
  attempts: AttemptRecord[];
  isPassed: boolean;
  isFullStars: boolean;
  unlockedAt?: string;
  passedAt?: string;
}

export interface StageSettlementSummary {
  missionId: string;
  questionId?: string;
  sensoryType: SensoryType;
  sense?: SensoryType;
  title: string;
  questionTitle?: string;
  finalSentence: string;
  submittedText?: string;
  submittedAt?: string;
  totalScore: number;
  sensoryMatch: boolean;
  sensoryReason?: string;
  hasFormalSubmission: boolean;
  attemptsCount: number;
  isPassed: boolean;
  isFullStars: boolean;
  stampIcon: string;
  stampName: string;
  firstSentence?: string;
  progressNote?: string;
}

export interface RoundSettlement {
  roundId: string;
  roundNumber: number;
  settledAt: string;
  totalStars: number; // 0 to 25
  fullStarsCount: number; // 0 to 5
  passedCount: number; // 0 to 5
  overallFeedback: string;
  stageSummaries: StageSettlementSummary[];
}

export interface RoundData {
  roundId: string;
  roundNumber: number;
  createdAt: string;
  completedAt?: string;
  missions: Mission[]; // Strictly 5 missions in order: visual, auditory, olfactory, gustatory, tactile
  progress: Record<string, MissionProgress>;
  settlement?: RoundSettlement;
}
