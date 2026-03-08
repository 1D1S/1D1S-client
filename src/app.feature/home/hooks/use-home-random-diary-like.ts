import { DIARY_QUERY_KEYS } from '@feature/diary/board/consts/query-keys';
import {
  type DiaryDetail,
  type DiaryItem,
} from '@feature/diary/board/type/diary';
import { diaryDetailApi } from '@feature/diary/detail/api/diary-detail-api';
import { notifyApiError } from '@module/api/error';
import { authStorage } from '@module/utils/auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

interface UseHomeRandomDiaryLikeResult {
  isLikePending: boolean;
  showLoginDialog: boolean;
  setShowLoginDialog(open: boolean): void;
  onLikeToggle(diary: DiaryItem): void;
}

function resolveNextLikeCount(
  diary: DiaryItem,
  likedByMe: boolean,
  likeCountFromServer?: number
): number {
  if (
    typeof likeCountFromServer === 'number' &&
    Number.isFinite(likeCountFromServer)
  ) {
    return Math.max(0, likeCountFromServer);
  }

  if (diary.likeInfo.likedByMe === likedByMe) {
    return diary.likeInfo.likeCnt;
  }

  return Math.max(0, diary.likeInfo.likeCnt + (likedByMe ? 1 : -1));
}

function updateDiaryLikeInfo(
  diary: DiaryItem,
  likedByMe: boolean,
  likeCountFromServer?: number
): DiaryItem {
  return {
    ...diary,
    likeInfo: {
      ...diary.likeInfo,
      likedByMe,
      likeCnt: resolveNextLikeCount(diary, likedByMe, likeCountFromServer),
    },
  };
}

function updateDiaryListLikeInfo(
  diaries: DiaryItem[] | undefined,
  diaryId: number,
  likedByMe: boolean,
  likeCountFromServer?: number
): DiaryItem[] | undefined {
  if (!Array.isArray(diaries)) {
    return diaries;
  }

  return diaries.map((diary) =>
    diary.id === diaryId
      ? updateDiaryLikeInfo(diary, likedByMe, likeCountFromServer)
      : diary
  );
}

export function useHomeRandomDiaryLike(): UseHomeRandomDiaryLikeResult {
  const queryClient = useQueryClient();
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const updateCachedDiaryLikes = (
    diaryId: number,
    likedByMe: boolean,
    likeCountFromServer?: number
  ): void => {
    queryClient.setQueriesData<DiaryItem[]>(
      {
        queryKey: DIARY_QUERY_KEYS.all,
        predicate: (query) => query.queryKey.includes('random'),
      },
      (current) =>
        updateDiaryListLikeInfo(
          current,
          diaryId,
          likedByMe,
          likeCountFromServer
        )
    );

    queryClient.setQueryData<DiaryItem[]>(
      DIARY_QUERY_KEYS.allDiaries(),
      (current) =>
        updateDiaryListLikeInfo(
          current,
          diaryId,
          likedByMe,
          likeCountFromServer
        )
    );

    queryClient.setQueryData<DiaryDetail>(
      DIARY_QUERY_KEYS.detail(diaryId),
      (current) => {
        if (!current) {
          return current;
        }

        return updateDiaryLikeInfo(current, likedByMe, likeCountFromServer);
      }
    );
  };

  const likeDiary = useMutation({
    mutationFn: (diaryId: number) => diaryDetailApi.likeDiary(diaryId),
    onSuccess: (likeCount, diaryId) => {
      updateCachedDiaryLikes(diaryId, true, likeCount);
    },
    onError: (error) => {
      notifyApiError(error);
    },
  });

  const unlikeDiary = useMutation({
    mutationFn: (diaryId: number) => diaryDetailApi.unlikeDiary(diaryId),
    onSuccess: (likeCount, diaryId) => {
      updateCachedDiaryLikes(diaryId, false, likeCount);
    },
    onError: (error) => {
      notifyApiError(error);
    },
  });

  const isLikePending = likeDiary.isPending || unlikeDiary.isPending;

  const onLikeToggle = (diary: DiaryItem): void => {
    if (!authStorage.hasTokens()) {
      setShowLoginDialog(true);
      return;
    }

    if (isLikePending) {
      return;
    }

    if (diary.likeInfo.likedByMe) {
      unlikeDiary.mutate(diary.id);
      return;
    }

    likeDiary.mutate(diary.id);
  };

  return {
    isLikePending,
    showLoginDialog,
    setShowLoginDialog,
    onLikeToggle,
  };
}
