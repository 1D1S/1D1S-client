import { invalidateAll } from '@module/api/queryInvalidation';
import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';

import { CHALLENGE_QUERY_KEYS } from '../../../challenge/board/consts/queryKeys';
import { MEMBER_QUERY_KEYS } from '../../../member/consts/queryKeys';
import { DIARY_QUERY_KEYS } from '../../board/consts/queryKeys';
import {
  CreateDiaryReportRequest,
  CreateDiaryRequest,
  CreateDiaryResponse,
  UpdateDiaryRequest,
  UpdateDiaryResponse,
  UploadImageResponse,
} from '../../board/type/diary';
import { diaryWriteApi } from '../../write/api/diaryWriteApi';
import { diaryDetailApi } from '../api/diaryDetailApi';

// 다이어리 생성하기
export function useCreateDiary(): UseMutationResult<
  CreateDiaryResponse,
  Error,
  CreateDiaryRequest
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDiaryRequest) => diaryWriteApi.createDiary(data),
    onSuccess: (_, variables) => {
      invalidateAll(queryClient, [
        DIARY_QUERY_KEYS.lists(),
        DIARY_QUERY_KEYS.randoms(),
        DIARY_QUERY_KEYS.allDiaries(),
        MEMBER_QUERY_KEYS.myPage(),
        MEMBER_QUERY_KEYS.sidebar(),
        CHALLENGE_QUERY_KEYS.checkWrite(variables.challengeId),
      ]);
    },
  });
}

// 다이어리 수정하기
export function useUpdateDiary(): UseMutationResult<
  UpdateDiaryResponse,
  Error,
  { id: number; data: UpdateDiaryRequest }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateDiaryRequest }) =>
      diaryWriteApi.updateDiary(id, data),
    onSuccess: (_, { id }) => {
      invalidateAll(queryClient, [
        DIARY_QUERY_KEYS.detail(id),
        DIARY_QUERY_KEYS.lists(),
        DIARY_QUERY_KEYS.randoms(),
        DIARY_QUERY_KEYS.allDiaries(),
        CHALLENGE_QUERY_KEYS.challengeDiaries(),
      ]);
    },
  });
}

// 다이어리 삭제하기
export function useDeleteDiary(): UseMutationResult<boolean, Error, number> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => diaryDetailApi.deleteDiary(id),
    onSuccess: () => {
      invalidateAll(queryClient, [
        DIARY_QUERY_KEYS.lists(),
        DIARY_QUERY_KEYS.randoms(),
        DIARY_QUERY_KEYS.allDiaries(),
        CHALLENGE_QUERY_KEYS.challengeDiaries(),
        MEMBER_QUERY_KEYS.myPage(),
        MEMBER_QUERY_KEYS.sidebar(),
      ]);
    },
  });
}

// 다이어리 좋아요 누르기
export function useLikeDiary(): UseMutationResult<number, Error, number> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => diaryDetailApi.likeDiary(id),
    onSuccess: (_, id) => {
      invalidateAll(queryClient, [
        DIARY_QUERY_KEYS.detail(id),
        DIARY_QUERY_KEYS.lists(),
        DIARY_QUERY_KEYS.randoms(),
        DIARY_QUERY_KEYS.allDiaries(),
        CHALLENGE_QUERY_KEYS.challengeDiaries(),
        MEMBER_QUERY_KEYS.profiles(),
        DIARY_QUERY_KEYS.my(),
      ]);
    },
  });
}

// 다이어리 좋아요 취소하기
export function useUnlikeDiary(): UseMutationResult<number, Error, number> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => diaryDetailApi.unlikeDiary(id),
    onSuccess: (_, id) => {
      invalidateAll(queryClient, [
        DIARY_QUERY_KEYS.detail(id),
        DIARY_QUERY_KEYS.lists(),
        DIARY_QUERY_KEYS.randoms(),
        DIARY_QUERY_KEYS.allDiaries(),
        CHALLENGE_QUERY_KEYS.challengeDiaries(),
        MEMBER_QUERY_KEYS.profiles(),
        DIARY_QUERY_KEYS.my(),
      ]);
    },
  });
}

// 다이어리 리포트 생성하기
export function useCreateDiaryReport(): UseMutationResult<
  boolean,
  Error,
  CreateDiaryReportRequest
> {
  return useMutation({
    mutationFn: (data: CreateDiaryReportRequest) =>
      diaryWriteApi.createDiaryReport(data),
  });
}

// 다이어리에 이미지 1개 업로드하기
export function useUploadDiaryImage(): UseMutationResult<
  UploadImageResponse,
  Error,
  { id: number; file: File }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      diaryWriteApi.uploadDiaryImage(id, file),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: DIARY_QUERY_KEYS.detail(id),
      });
    },
  });
}
