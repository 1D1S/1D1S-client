import type {
  DiaryTrendParams,
  FeelingStatisticsParams,
  FriendComparisonPeriod,
  StatisticsPeriodUnit,
  StatisticsSummaryParams,
} from '../type/statistics';

export const STATISTICS_QUERY_KEYS = {
  all: ['member', 'statistics'] as const,
  feelings: (params: FeelingStatisticsParams) =>
    [...STATISTICS_QUERY_KEYS.all, 'feelings', params] as const,
  diaryTrend: (params: DiaryTrendParams) =>
    [...STATISTICS_QUERY_KEYS.all, 'diary-trend', params] as const,
  periods: (unit: StatisticsPeriodUnit) =>
    [...STATISTICS_QUERY_KEYS.all, 'periods', unit] as const,
  summary: (params: StatisticsSummaryParams) =>
    [...STATISTICS_QUERY_KEYS.all, 'summary', params] as const,
  friendComparison: (period: FriendComparisonPeriod) =>
    [...STATISTICS_QUERY_KEYS.all, 'friend-comparison', period] as const,
};
