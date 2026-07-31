'use client';

import { requestNativePushRoute } from '@module/utils/nativeBridge';
import { useRouter } from 'next/navigation';
import React, { useRef } from 'react';

interface UseCommentThreadDelegationParams {
  /** DFS 순서 작성자 id (아바타 클릭 → 멤버 프로필 이동) */
  flatCommentAuthors: Array<{ id: string }>;
  /** <li> 문서 순서 메타 (삭제 행 클릭 차단·답글 대상) */
  flatCommentMeta: Array<{
    id: number;
    isDeleted: boolean;
    authorNickname: string;
  }>;
  /** 대댓글 id → 루트 댓글 id (답글은 항상 루트에 달림) */
  replyTargetRootIdMap: Map<number, number>;
  /**
   * 앱(웹뷰): true 면 DS 인라인 답글 입력 대신 네이티브 입력으로 라우팅한다.
   * "답글" 토글 탭을 가로채 DS 가 자체 입력을 열지 못하게 막고, 대상 댓글을
   * onNativeReplyStart 로 알린다. false(브라우저)면 DS 기본 동작.
   */
  nativeReplyActive: boolean;
  onNativeReplyStart?(parentId: number, replyingTo: string): void;
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
  replyTargetRootIdMap,
  nativeReplyActive,
  onNativeReplyStart,
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

    // 앱: "답글" 토글 탭을 가로채 네이티브 입력으로 라우팅한다. capture 단계
    // stopPropagation 으로 DS 의 답글-열기 핸들러가 실행되지 않아 인라인 입력이
    // 뜨지 않는다(삭제 행 차단과 동일한 기법).
    if (nativeReplyActive) {
      const replyButton = target.closest('button');
      if (
        replyButton &&
        commentWrapperRef.current.contains(replyButton) &&
        replyButton.textContent?.trim() === '답글'
      ) {
        const li = replyButton.closest('li');
        const allLis = Array.from(
          commentWrapperRef.current.querySelectorAll('li')
        );
        const liIndex = li ? allLis.indexOf(li) : -1;
        const meta = liIndex >= 0 ? flatCommentMeta[liIndex] : undefined;
        if (meta && !meta.isDeleted) {
          event.stopPropagation();
          event.preventDefault();
          const parentId = replyTargetRootIdMap.get(meta.id) ?? meta.id;
          onNativeReplyStart?.(parentId, meta.authorNickname);
        }
        return;
      }
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
      const path = `/member/${memberId}`;
      if (!requestNativePushRoute(path)) {
        router.push(path);
      }
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
