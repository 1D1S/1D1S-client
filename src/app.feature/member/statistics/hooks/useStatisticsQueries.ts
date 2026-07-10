import { useIsLoggedIn } from '@feature/member/hooks/useIsLoggedIn';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { statisticsApi } from '../api/statisticsApi';
import { STATISTICS_QUERY_KEYS } from '../consts/queryKeys';
import type {
  DiaryTrendParams,
  DiaryTrendStatistics,
  FeelingStatistics,
  FeelingStatisticsParams,
  FriendComparison,
  FriendComparisonPeriod,
  StatisticsPeriods,
  StatisticsPeriodUnit,
  StatisticsSummary,
  StatisticsSummaryParams,
} from '../type/statistics';

// 통계는 자주 바뀌지 않으므로 5분간 stale 유지 (재패칭 최소화).
const STATISTICS_STALE_TIME = 5 * 60 * 1000;

export function useFeelingStatistics(
  params: FeelingStatisticsParams = {}
): UseQueryResult<FeelingStatistics, Error> {
  const isLoggedIn = useIsLoggedIn();
  return useQuery({
    queryKey: STATISTICS_QUERY_KEYS.feelings(params),
    queryFn: () => statisticsApi.getFeelings(params),
    enabled: isLoggedIn,
    staleTime: STATISTICS_STALE_TIME,
  });
}

export function useDiaryTrend(
  params: DiaryTrendParams
): UseQueryResult<DiaryTrendStatistics, Error> {
  const isLoggedIn = useIsLoggedIn();
  return useQuery({
    queryKey: STATISTICS_QUERY_KEYS.diaryTrend(params),
    queryFn: () => statisticsApi.getDiaryTrend(params),
    enabled: isLoggedIn,
    staleTime: STATISTICS_STALE_TIME,
  });
}

export function useStatisticsPeriods(
  unit: StatisticsPeriodUnit
): UseQueryResult<StatisticsPeriods, Error> {
  const isLoggedIn = useIsLoggedIn();
  return useQuery({
    queryKey: STATISTICS_QUERY_KEYS.periods(unit),
    queryFn: () => statisticsApi.getPeriods(unit),
    enabled: isLoggedIn,
    staleTime: STATISTICS_STALE_TIME,
  });
}

export function useStatisticsSummary(
  params: StatisticsSummaryParams
): UseQueryResult<StatisticsSummary, Error> {
  const isLoggedIn = useIsLoggedIn();
  return useQuery({
    queryKey: STATISTICS_QUERY_KEYS.summary(params),
    queryFn: () => statisticsApi.getSummary(params),
    // periodKey 는 서버 필수 파라미터 — 확정 전(초기 렌더)에는 요청하지
    // 않아 "필수 파라미터 누락" 400 을 방지한다.
    enabled: isLoggedIn && Boolean(params.periodKey),
    staleTime: STATISTICS_STALE_TIME,
  });
}

export function useFriendComparison(
  period: FriendComparisonPeriod
): UseQueryResult<FriendComparison, Error> {
  const isLoggedIn = useIsLoggedIn();
  return useQuery({
    queryKey: STATISTICS_QUERY_KEYS.friendComparison(period),
    queryFn: () => statisticsApi.getFriendComparison(period),
    enabled: isLoggedIn,
    staleTime: STATISTICS_STALE_TIME,
  });
}
