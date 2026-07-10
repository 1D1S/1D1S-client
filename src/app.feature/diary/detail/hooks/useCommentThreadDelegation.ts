'use client';

import { useRouter } from 'next/navigation';
import React, { useRef } from 'react';

interface UseCommentThreadDelegationParams {
  /** DFS 순서 작성자 id (아바타 클릭 → 멤버 프로필 이동) */
  flatCommentAuthors: Array<{ id: string }>;
  /** <li> 문서 순서 메타 (삭제 행 클릭 차단) */
  flatCommentMeta: Array<{ id: number; isDeleted: boolean }>;
}

export interface UseCommentThreadDelegationResult {
  commentWrapperRef: React.RefObject<HTMLDivElement | null>;
  handleCommentWrapperClickCapture(
    event: React.MouseEvent<HTMLDivElement>
  ): void;
}

/**
 * DS CommentThread 에 이벤트 위임을 붙이는 훅. 아바타 클릭은 멤버 프로필로
 * 이동시키고, 삭제된 댓글 행 클릭은 DS 의 답글 오픈 핸들러로 전달되지 않게
 * 차단한다. DiaryCommentSection 에서 분리했으며 동작은 동일하다.
 */
export function useCommentThreadDelegation({
  flatCommentAuthors,
  flatCommentMeta,
}: UseCommentThreadDelegationParams): UseCommentThreadDelegationResult {
  const router = useRouter();
  const commentWrapperRef = useRef<HTMLDivElement>(null);

  const handleCommentWrapperClickCapture = (
    event: React.MouseEvent<HTMLDivElement>
  ): void => {
    const target = event.target as Element | null;
    if (!target || !commentWrapperRef.current) {
      return;
    }

    const avatar = target.closest('[data-slot="circle-avatar"]');
    if (avatar) {
      const avatars = commentWrapperRef.current.querySelectorAll(
        '[data-slot="circle-avatar"]'
      );
      const index = Array.from(avatars).indexOf(avatar);
      if (index < 0) {
        return;
      }
      const author = flatCommentAuthors[index];
      if (!author) {
        return;
      }
      const memberId = Number(author.id);
      if (!Number.isFinite(memberId) || memberId <= 0) {
        return;
      }
      event.stopPropagation();
      event.preventDefault();
      router.push(`/member/${memberId}`);
      return;
    }

    // 삭제된 댓글 행 클릭은 DS 의 답글 입력 오픈 핸들러로 전달되지 않게 차단.
    const li = target.closest('li');
    if (!li || !commentWrapperRef.current.contains(li)) {
      return;
    }
    const allLis = Array.from(commentWrapperRef.current.querySelectorAll('li'));
    const liIndex = allLis.indexOf(li);
    if (liIndex < 0) {
      return;
    }
    const meta = flatCommentMeta[liIndex];
    if (meta?.isDeleted) {
      event.stopPropagation();
      event.preventDefault();
    }
  };

  return { commentWrapperRef, handleCommentWrapperClickCapture };
}
