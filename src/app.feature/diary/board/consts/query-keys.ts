import { DiaryListParams, RandomDiaryParams } from '../type/diary';

export const DIARY_QUERY_KEYS = {
  all: ['diaries'] as const,
  lists: () => [...DIARY_QUERY_KEYS.all, 'list'] as const,
  list: (params: DiaryListParams) =>
    [...DIARY_QUERY_KEYS.lists(), params] as const,
  details: () => [...DIARY_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...DIARY_QUERY_KEYS.details(), id] as const,
  random: (params: RandomDiaryParams) =>
    [...DIARY_QUERY_KEYS.all, 'random', params] as const,
  allDiaries: () => [...DIARY_QUERY_KEYS.all, 'all'] as const,
};
