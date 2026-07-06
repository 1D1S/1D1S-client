import { invalidateAll } from '@module/api/queryInvalidation';
import type { LikeInfo } from '@module/api/types';
import {
  QueryClient,
  useMutation,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';

import { compressImageFile } from '@/app.lib/compressImage';

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
        MEMBER_QUERY_KEYS.profiles(),
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
      // 목록 캐시는 즉시 제거해 삭제된 일지가 잠깐 보이는 현상을 방지한다.
      queryClient.removeQueries({ queryKey: DIARY_QUERY_KEYS.lists() });
      queryClient.removeQueries({ queryKey: DIARY_QUERY_KEYS.allDiaries() });
      invalidateAll(queryClient, [
        DIARY_QUERY_KEYS.randoms(),
        CHALLENGE_QUERY_KEYS.challengeDiaries(),
        MEMBER_QUERY_KEYS.myPage(),
        MEMBER_QUERY_KEYS.sidebar(),
        MEMBER_QUERY_KEYS.profiles(),
      ]);
    },
  });
}

// 좋아요가 반영돼야 하는 캐시 키들 — 낙관적 업데이트 실패 시에만
// invalidate 로 서버 상태에 재동기화한다.
function likeAffectedKeys(
  id: number
): ReadonlyArray<readonly unknown[]> {
  return [
    DIARY_QUERY_KEYS.detail(id),
    DIARY_QUERY_KEYS.lists(),
    DIARY_QUERY_KEYS.randoms(),
    CHALLENGE_QUERY_KEYS.challengeDiaries(),
    DIARY_QUERY_KEYS.my(),
    MEMBER_QUERY_KEYS.profiles(),
  ];
}

// 캐시 트리를 걸어 내려가며 해당 일지(id 일치 + likeInfo 보유)를 찾아
// likeInfo 만 교체한다. 일지 객체만 `id` + `likeInfo` 조합을 가진다
// (챌린지는 `challengeId` 를 사용). 변경된 경로만 새 참조를 만들어
// (구조 공유) React.memo 카드의 불필요한 재렌더를 막는다.
function patchDiaryLike(
  node: unknown,
  diaryId: number,
  apply: (like: LikeInfo) => LikeInfo
): unknown {
  if (Array.isArray(node)) {
    let changed = false;
    const next = node.map((child) => {
      const patched = patchDiaryLike(child, diaryId, apply);
      if (patched !== child) {
        changed = true;
      }
      return patched;
    });
    return changed ? next : node;
  }

  if (node !== null && typeof node === 'object') {
    const record = node as Record<string, unknown>;
    if (record.id === diaryId && record.likeInfo) {
      return { ...record, likeInfo: apply(record.likeInfo as LikeInfo) };
    }

    let changed = false;
    const next: Record<string, unknown> = {};
    for (const key of Object.keys(record)) {
      const patched = patchDiaryLike(record[key], diaryId, apply);
      next[key] = patched;
      if (patched !== record[key]) {
        changed = true;
      }
    }
    return changed ? next : node;
  }

  return node;
}

// 캐시 전체에 좋아요 상태를 즉시 반영한다. 변경 없는 쿼리는 같은 참조를
// 돌려받아 구독자 알림이 발생하지 않으므로 전 쿼리 순회 비용은 미미하다.
function applyLikeToCache(
  queryClient: QueryClient,
  diaryId: number,
  apply: (like: LikeInfo) => LikeInfo
): void {
  queryClient.setQueriesData({ predicate: () => true }, (data: unknown) =>
    patchDiaryLike(data, diaryId, apply)
  );
}

// 다이어리 좋아요 누르기 — 낙관적 업데이트. 클릭 즉시 캐시를 고쳐
// UI 에 반영하고, 서버 요청은 뒤에서 진행한다. 성공 시에는 재요청이
// 없고(캐시가 이미 정답), 실패 시에만 invalidate 로 되돌린다.
export function useLikeDiary(): UseMutationResult<number, Error, number> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => diaryDetailApi.likeDiary(id),
    onMutate: (id) => {
      applyLikeToCache(queryClient, id, (like) =>
        like.likedByMe
          ? like
          : { likedByMe: true, likeCnt: like.likeCnt + 1 }
      );
    },
    onError: (_, id) => {
      invalidateAll(queryClient, likeAffectedKeys(id));
    },
  });
}

// 다이어리 좋아요 취소하기 — 낙관적 업데이트 (useLikeDiary 와 대칭)
export function useUnlikeDiary(): UseMutationResult<number, Error, number> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => diaryDetailApi.unlikeDiary(id),
    onMutate: (id) => {
      applyLikeToCache(queryClient, id, (like) =>
        like.likedByMe
          ? { likedByMe: false, likeCnt: Math.max(0, like.likeCnt - 1) }
          : like
      );
    },
    onError: (_, id) => {
      invalidateAll(queryClient, likeAffectedKeys(id));
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
    mutationFn: async ({ id, file }: { id: number; file: File }) => {
      const compressed = await compressImageFile(file);
      return diaryWriteApi.uploadDiaryImage(id, compressed);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: DIARY_QUERY_KEYS.detail(id),
      });
    },
  });
}
