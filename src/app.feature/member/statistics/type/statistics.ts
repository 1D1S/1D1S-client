import type { Feeling } from '@feature/diary/board/type/diary';

// 서버 통계 API 계약 (1D1S-server-v2 #315). 전부 GET, 본인 인증.

export type StatisticsPeriodUnit = 'WEEK' | 'MONTH' | 'YEAR';
export type DiaryTrendUnit = 'DAY' | 'WEEK' | 'MONTH';
export type FriendComparisonPeriod = 'WEEK' | 'MONTH';

// 1. 감정 분포
export interface FeelingDistributionItem {
  feeling: Feeling; // HAPPY | SAD | NORMAL | NONE(미선택)
  count: number;
  ratio: number; // 0~1
}

export interface FeelingStatistics {
  total: number;
  distribution: FeelingDistributionItem[];
}

export interface FeelingStatisticsParams {
  from?: string;
  to?: string;
  challengeId?: number;
}

// 2. 작성 추이
export interface DiaryTrendPoint {
  bucket: string;
  count: number;
}

export interface DiaryTrendStatistics {
  unit: DiaryTrendUnit;
  from: string;
  to: string;
  points: DiaryTrendPoint[];
}

export interface DiaryTrendParams {
  unit: DiaryTrendUnit;
  from?: string;
  to?: string;
}

// 3. 기간 목록
export interface StatisticsPeriod {
  key: string;
  start: string;
  end: string;
  label: string;
}

export interface StatisticsPeriods {
  unit: StatisticsPeriodUnit;
  signupDate: string;
  periods: StatisticsPeriod[];
}

// 4. 기간 요약
export interface FeelingBreakdownItem {
  feeling: Feeling;
  count: number;
}

export interface PeakBucket {
  key: string;
  count: number;
}

export interface StatisticsSummary {
  unit: StatisticsPeriodUnit;
  periodKey: string;
  start: string;
  end: string;
  diaryCount: number;
  diaryCountDelta: number; // 전기간 대비 증감
  activeDays: number;
  completedGoalCount: number;
  goalCompletionRate: number; // 0~1
  feelingBreakdown: FeelingBreakdownItem[];
  maxStreakInPeriod: number;
  peakBucket: PeakBucket; // 가장 활발한 날(연간은 달)
  subTrend: DiaryTrendPoint[];
  hasPrev: boolean;
  hasNext: boolean;
}

export interface StatisticsSummaryParams {
  unit: StatisticsPeriodUnit;
  periodKey?: string;
}

// 5. 친구 비교
export interface FriendComparisonMetrics {
  diaryCount: number;
  completedGoalCount: number;
}

export interface FriendComparisonRank {
  byDiaryCount: number;
  outOf: number;
}

export interface FriendComparison {
  period: FriendComparisonPeriod;
  friendCount: number;
  me: FriendComparisonMetrics;
  friendsAverage: FriendComparisonMetrics;
  myRank: FriendComparisonRank;
}
