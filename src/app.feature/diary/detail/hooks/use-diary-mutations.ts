import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';

import { CHALLENGE_QUERY_KEYS } from '../../../challenge/board/consts/query-keys';
import { MEMBER_QUERY_KEYS } from '../../../member/consts/query-keys';
import { DIARY_QUERY_KEYS } from '../../board/consts/query-keys';
import {
  CreateDiaryReportRequest,
  CreateDiaryRequest,
  CreateDiaryResponse,
  UpdateDiaryRequest,
  UpdateDiaryResponse,
  UploadImageResponse,
  UploadImagesResponse,
} from '../../board/type/diary';
import { diaryWriteApi } from '../../write/api/diary-write-api';
import { diaryDetailApi } from '../api/diary-detail-api';

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
      // 다이어리 리스트 무효화
      queryClient.invalidateQueries({
        queryKey: DIARY_QUERY_KEYS.lists(),
      });
      // 랜덤 다이어리 무효화
      queryClient.invalidateQueries({
        queryKey: DIARY_QUERY_KEYS.all,
        predicate: (query) => query.queryKey.includes('random'),
      });
      // 모든 다이어리 무효화
      queryClient.invalidateQueries({
        queryKey: DIARY_QUERY_KEYS.allDiaries(),
      });
      // 내 정보 무효화
      queryClient.invalidateQueries({
        queryKey: MEMBER_QUERY_KEYS.myPage(),
      });
      queryClient.invalidateQueries({
        queryKey: MEMBER_QUERY_KEYS.sidebar(),
      });
      // 일지 작성 가능 날짜 무효화
      queryClient.invalidateQueries({
        queryKey: CHALLENGE_QUERY_KEYS.checkWrite(variables.challengeId),
      });
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
      // 해당 다이어리 상세 정보 무효화
      queryClient.invalidateQueries({
        queryKey: DIARY_QUERY_KEYS.detail(id),
      });
      // 다이어리 리스트 무효화
      queryClient.invalidateQueries({
        queryKey: DIARY_QUERY_KEYS.lists(),
      });
      // 랜덤 다이어리 무효화
      queryClient.invalidateQueries({
        queryKey: DIARY_QUERY_KEYS.all,
        predicate: (query) => query.queryKey.includes('random'),
      });
      // 모든 다이어리 무효화
      queryClient.invalidateQueries({
        queryKey: DIARY_QUERY_KEYS.allDiaries(),
      });
      // 챌린지 일지 리스트 무효화
      queryClient.invalidateQueries({
        queryKey: CHALLENGE_QUERY_KEYS.all,
        predicate: (query) => query.queryKey.includes('diaries'),
      });
    },
  });
}

// 다이어리 삭제하기
export function useDeleteDiary(): UseMutationResult<boolean, Error, number> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => diaryDetailApi.deleteDiary(id),
    onSuccess: () => {
      // 다이어리 리스트 무효화
      queryClient.invalidateQueries({
        queryKey: DIARY_QUERY_KEYS.lists(),
      });
      // 랜덤 다이어리 무효화
      queryClient.invalidateQueries({
        queryKey: DIARY_QUERY_KEYS.all,
        predicate: (query) => query.queryKey.includes('random'),
      });
      // 모든 다이어리 무효화
      queryClient.invalidateQueries({
        queryKey: DIARY_QUERY_KEYS.allDiaries(),
      });
      // 챌린지 일지 리스트 무효화
      queryClient.invalidateQueries({
        queryKey: CHALLENGE_QUERY_KEYS.all,
        predicate: (query) => query.queryKey.includes('diaries'),
      });
      // 내 정보 무효화
      queryClient.invalidateQueries({
        queryKey: MEMBER_QUERY_KEYS.myPage(),
      });
      queryClient.invalidateQueries({
        queryKey: MEMBER_QUERY_KEYS.sidebar(),
      });
    },
  });
}

// 다이어리 좋아요 누르기
export function useLikeDiary(): UseMutationResult<number, Error, number> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => diaryDetailApi.likeDiary(id),
    onSuccess: (_, id) => {
      // 해당 다이어리 상세 정보 무효화
      queryClient.invalidateQueries({
        queryKey: DIARY_QUERY_KEYS.detail(id),
      });
      // 다이어리 리스트 무효화
      queryClient.invalidateQueries({
        queryKey: DIARY_QUERY_KEYS.lists(),
      });
      // 랜덤 다이어리 무효화
      queryClient.invalidateQueries({
        queryKey: DIARY_QUERY_KEYS.all,
        predicate: (query) => query.queryKey.includes('random'),
      });
      // 모든 다이어리 무효화
      queryClient.invalidateQueries({
        queryKey: DIARY_QUERY_KEYS.allDiaries(),
      });
    },
  });
}

// 다이어리 좋아요 취소하기
export function useUnlikeDiary(): UseMutationResult<number, Error, number> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => diaryDetailApi.unlikeDiary(id),
    onSuccess: (_, id) => {
      // 해당 다이어리 상세 정보 무효화
      queryClient.invalidateQueries({
        queryKey: DIARY_QUERY_KEYS.detail(id),
      });
      // 다이어리 리스트 무효화
      queryClient.invalidateQueries({
        queryKey: DIARY_QUERY_KEYS.lists(),
      });
      // 랜덤 다이어리 무효화
      queryClient.invalidateQueries({
        queryKey: DIARY_QUERY_KEYS.all,
        predicate: (query) => query.queryKey.includes('random'),
      });
      // 모든 다이어리 무효화
      queryClient.invalidateQueries({
        queryKey: DIARY_QUERY_KEYS.allDiaries(),
      });
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
      // 해당 다이어리 상세 정보 무효화
      queryClient.invalidateQueries({
        queryKey: DIARY_QUERY_KEYS.detail(id),
      });
    },
  });
}

// 다이어리에 이미지 여러개 업로드하기
export function useUploadDiaryImages(): UseMutationResult<
  UploadImagesResponse,
  Error,
  { id: number; files: File[] }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, files }: { id: number; files: File[] }) =>
      diaryWriteApi.uploadDiaryImages(id, files),
    onSuccess: (_, { id }) => {
      // 해당 다이어리 상세 정보 무효화
      queryClient.invalidateQueries({
        queryKey: DIARY_QUERY_KEYS.detail(id),
      });
    },
  });
}
