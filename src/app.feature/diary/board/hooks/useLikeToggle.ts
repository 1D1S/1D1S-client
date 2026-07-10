'use client';
import { useCallback } from 'react';

import {
  useLikeDiary,
  useUnlikeDiary,
} from '../../detail/hooks/useDiaryMutations';

interface UseLikeToggleParams {
  isLoggedIn: boolean;
  // 비로그인 상태에서 좋아요를 누르면 호출된다. 화면별 로그인 안내
  // 다이얼로그(설명 문구 포함)를 각자 띄우도록 위임한다.
  onRequireLogin(): void;
}

interface UseLikeToggleResult {
  isLikePending: boolean;
  toggleLike(id: number, likedByMe: boolean): void;
}

/**
 * 일지 목록/보드 화면들에 복붙돼 있던 좋아요 토글 로직을 공통화한다.
 * - 비로그인 게이트: 미로그인 시 `onRequireLogin` 위임 후 종료
 * - 중복 요청 방지: 진행 중(isLikePending)이면 무시
 * - 낙관적 업데이트/무효화는 `useLikeDiary`/`useUnlikeDiary` 가 담당
 */
export function useLikeToggle({
  isLoggedIn,
  onRequireLogin,
}: UseLikeToggleParams): UseLikeToggleResult {
  const likeDiary = useLikeDiary();
  const unlikeDiary = useUnlikeDiary();
  const isLikePending = likeDiary.isPending || unlikeDiary.isPending;

  const toggleLike = useCallback(
    (id: number, likedByMe: boolean): void => {
      if (!isLoggedIn) {
        onRequireLogin();
        return;
      }
      if (isLikePending) {
        return;
      }
      if (likedByMe) {
        unlikeDiary.mutate(id);
      } else {
        likeDiary.mutate(id);
      }
    },
    [isLoggedIn, isLikePending, likeDiary, unlikeDiary, onRequireLogin]
  );

  return { isLikePending, toggleLike };
}
