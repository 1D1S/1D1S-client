import { apiClient } from '@module/api/client';
import { buildQueryString, requestData } from '@module/api/request';

import type {
  DiaryTrendParams,
  DiaryTrendStatistics,
  FeelingStatistics,
  FeelingStatisticsParams,
  FriendComparison,
  FriendComparisonParams,
  StatisticsPeriods,
  StatisticsPeriodUnit,
  StatisticsSummary,
  StatisticsSummaryParams,
} from '../type/statistics';

const withQuery = (base: string, query: string): string =>
  query ? `${base}?${query}` : base;

export const statisticsApi = {
  getFeelings: async (
    params: FeelingStatisticsParams = {}
  ): Promise<FeelingStatistics> =>
    requestData<FeelingStatistics>(apiClient, {
      url: withQuery(
        '/member/statistics/feelings',
        buildQueryString({
          from: params.from,
          to: params.to,
          challengeId: params.challengeId,
        })
      ),
      method: 'GET',
    }),

  getDiaryTrend: async (
    params: DiaryTrendParams
  ): Promise<DiaryTrendStatistics> =>
    requestData<DiaryTrendStatistics>(apiClient, {
      url: withQuery(
        '/member/statistics/diary-trend',
        buildQueryString({
          unit: params.unit,
          from: params.from,
          to: params.to,
        })
      ),
      method: 'GET',
    }),

  getPeriods: async (
    unit: StatisticsPeriodUnit
  ): Promise<StatisticsPeriods> =>
    requestData<StatisticsPeriods>(apiClient, {
      url: withQuery(
        '/member/statistics/periods',
        buildQueryString({ unit })
      ),
      method: 'GET',
    }),

  getSummary: async (
    params: StatisticsSummaryParams
  ): Promise<StatisticsSummary> =>
    requestData<StatisticsSummary>(apiClient, {
      url: withQuery(
        '/member/statistics/summary',
        buildQueryString({
          unit: params.unit,
          periodKey: params.periodKey,
        })
      ),
      method: 'GET',
    }),

  getFriendComparison: async (
    params: FriendComparisonParams
  ): Promise<FriendComparison> =>
    requestData<FriendComparison>(apiClient, {
      url: withQuery(
        '/member/statistics/friend-comparison',
        buildQueryString({
          period: params.period,
          friendId: params.friendId,
        })
      ),
      method: 'GET',
    }),
};
