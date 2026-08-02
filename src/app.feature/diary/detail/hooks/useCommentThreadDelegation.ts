'use client';

import { requestNativePushRoute } from '@module/utils/nativeBridge';
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

    // 답글 입력 포커스는 DS 2.11.2 autoFocusReply(기본 true)가 열림과 동시에
    // 정확히 그 입력만 잡는다(inert 기반). 웹이 [data-reply-input] 에 또 focus()
    // 하면 이중 포커스 → 브라우저 기본 포커스-스크롤이 두 번 발동해 화면이
    // 위아래로 튀었다(중복 제거). 포커스 주체를 DS 로 일원화한다. "답글 달기"
    // 버튼 클릭은 아래 삭제-행 차단의 button 예외로 그대로 DS 로 전달된다.
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

    // 삭제된 댓글 행의 "본문" 클릭만 차단한다. 그 행에 열린 답글 composer 의
    // 버튼(취소/등록)·입력([data-reply-input])은 통과시켜야 한다 — 마지막
    // 대댓글이 삭제된 스레드에서 답글을 열고 "취소"로 닫을 수 있어야 메인
    // composer 가 복귀한다(버그B). 삭제 행 안에 열린 composer 버튼까지 막으면
    // 취소가 안 먹어 답글 모드에 갇힌다.
    if (target.closest('button') || target.closest('[data-reply-input]')) {
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
