import { DIARY_QUERY_KEYS } from '@feature/diary/board/consts/queryKeys';
import {
  type DiaryDetail,
  type DiaryItem,
  type LikeInfo,
} from '@feature/diary/board/type/diary';
import { diaryDetailApi } from '@feature/diary/detail/api/diaryDetailApi';
import { useIsLoggedIn } from '@feature/member/hooks/useIsLoggedIn';
import { notifyApiError } from '@module/api/errorNotify';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

interface UseHomeRandomDiaryLikeResult {
  isLikePending: boolean;
  showLoginDialog: boolean;
  setShowLoginDialog(open: boolean): void;
  onLikeToggle(diary: DiaryItem): void;
}

function resolveNextLikeCount(
  likeInfo: LikeInfo,
  likedByMe: boolean,
  likeCountFromServer?: number
): number {
  if (
    typeof likeCountFromServer === 'number' &&
    Number.isFinite(likeCountFromServer)
  ) {
    return Math.max(0, likeCountFromServer);
  }

  if (likeInfo.likedByMe === likedByMe) {
    return likeInfo.likeCnt;
  }

  return Math.max(0, likeInfo.likeCnt + (likedByMe ? 1 : -1));
}

// 목록 아이템(DiaryItem)과 상세(DiaryDetail) 모두 likeInfo 만 갱신하므로
// likeInfo 를 가진 어떤 형태든 받도록 제네릭으로 둔다.
function updateDiaryLikeInfo<T extends { likeInfo: LikeInfo }>(
  diary: T,
  likedByMe: boolean,
  likeCountFromServer?: number
): T {
  return {
    ...diary,
    likeInfo: {
      ...diary.likeInfo,
      likedByMe,
      likeCnt: resolveNextLikeCount(
        diary.likeInfo,
        likedByMe,
        likeCountFromServer
      ),
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
  const isLoggedIn = useIsLoggedIn();
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const updateCachedDiaryLikes = (
    diaryId: number,
    likedByMe: boolean,
    likeCountFromServer?: number
  ): void => {
    queryClient.setQueriesData<DiaryItem[]>(
      { queryKey: DIARY_QUERY_KEYS.randoms() },
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
    if (!isLoggedIn) {
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
