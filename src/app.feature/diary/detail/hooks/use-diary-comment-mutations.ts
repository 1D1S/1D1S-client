import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';

import { DIARY_QUERY_KEYS } from '../../board/consts/query-keys';
import { diaryCommentApi } from '../api/diary-comment-api';
import { CreateCommentRequest } from '../type/comment';

function invalidateDiaryCommentQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  diaryId: number
): void {
  queryClient.invalidateQueries({
    queryKey: DIARY_QUERY_KEYS.diaryComments(diaryId),
  });
  queryClient.invalidateQueries({
    queryKey: DIARY_QUERY_KEYS.commentReplies(),
  });
}

export function useCreateDiaryComment(
  diaryId: number
): UseMutationResult<void, Error, CreateCommentRequest> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCommentRequest) =>
      diaryCommentApi.createDiaryComment(diaryId, data),
    onSuccess: () => invalidateDiaryCommentQueries(queryClient, diaryId),
  });
}

export function useCreateCommentReply(
  diaryId: number
): UseMutationResult<void, Error, { commentId: number; content: string }> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, content }) =>
      diaryCommentApi.createCommentReply(commentId, { content }),
    onSuccess: () => invalidateDiaryCommentQueries(queryClient, diaryId),
  });
}

export function useDeleteComment(
  diaryId: number
): UseMutationResult<void, Error, number> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: number) => diaryCommentApi.deleteComment(commentId),
    onSuccess: () => invalidateDiaryCommentQueries(queryClient, diaryId),
  });
}
