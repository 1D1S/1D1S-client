import { useQuery, UseQueryResult } from '@tanstack/react-query';

import { DIARY_QUERY_KEYS } from '../../board/consts/query-keys';
import { diaryCommentApi } from '../api/diary-comment-api';
import {
  DiaryComment,
  DiaryCommentListParams,
  DiaryCommentListResponse,
} from '../type/comment';

export function useDiaryComments(
  diaryId: number,
  params: DiaryCommentListParams = {}
): UseQueryResult<DiaryCommentListResponse, Error> {
  return useQuery({
    queryKey: DIARY_QUERY_KEYS.diaryComments(diaryId, params),
    queryFn: () => diaryCommentApi.getDiaryComments(diaryId, params),
    enabled: diaryId > 0,
  });
}

export function useCommentRepliesMap(
  commentIds: number[],
  params: DiaryCommentListParams & { enabled?: boolean } = {}
): UseQueryResult<Record<number, DiaryComment[]>, Error> {
  const { enabled = true, ...queryParams } = params;
  const sortedCommentIds = [...commentIds].sort(
    (leftId, rightId) => leftId - rightId
  );
  const shouldFetch = enabled && sortedCommentIds.length > 0;

  return useQuery({
    queryKey: DIARY_QUERY_KEYS.repliesMap(sortedCommentIds, queryParams),
    queryFn: async () => {
      const entries = await Promise.all(
        sortedCommentIds.map(async (commentId) => {
          const response = await diaryCommentApi.getCommentReplies(
            commentId,
            queryParams
          );
          return [commentId, response.items] as const;
        })
      );

      return Object.fromEntries(entries);
    },
    enabled: shouldFetch,
  });
}
