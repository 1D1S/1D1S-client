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
  my: () => [...DIARY_QUERY_KEYS.all, 'my'] as const,
  myDiaries: (params?: { size?: number }) =>
    [...DIARY_QUERY_KEYS.my(), params] as const,
  memberDiaries: (memberId: number, params?: { size?: number }) =>
    [...DIARY_QUERY_KEYS.all, 'member', memberId, params] as const,
  comments: () => [...DIARY_QUERY_KEYS.all, 'comments'] as const,
  diaryComments: (diaryId: number, params?: { page?: number; size?: number }) =>
    [...DIARY_QUERY_KEYS.comments(), 'diary', diaryId, params] as const,
  commentReplies: () => [...DIARY_QUERY_KEYS.comments(), 'replies'] as const,
  replies: (commentId: number, params?: { page?: number; size?: number }) =>
    [...DIARY_QUERY_KEYS.commentReplies(), commentId, params] as const,
  repliesMap: (
    commentIds: number[],
    params?: { page?: number; size?: number }
  ) => [...DIARY_QUERY_KEYS.commentReplies(), 'map', commentIds, params] as const,
};
