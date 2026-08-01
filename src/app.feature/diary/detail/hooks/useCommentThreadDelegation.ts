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

// DS 인라인 답글 입력이 열린 뒤(리렌더) 그 댓글의 입력에 포커스를 맞춘다. DS
// 가 자동 포커스를 잡지 못해 포커스가 엉뚱한 곳에 남던 버그를 웹에서 보정한다.
// 입력이 아직 안 그려졌을 수 있어 몇 프레임 재시도한다. 키보드 위로 스크롤하는
// 것은 입력의 onFocus(handleCommentInputFocus)가 visualViewport 기준으로 맡는다.
function focusReplyInputSoon(li: Element): void {
  let tries = 0;
  const tryFocus = (): void => {
    const input = li.querySelector<HTMLElement>(
      'textarea, [contenteditable="true"]'
    );
    if (input) {
      input.focus();
      return;
    }
    if (tries < 5) {
      tries += 1;
      requestAnimationFrame(tryFocus);
    }
  };
  requestAnimationFrame(tryFocus);
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

    // "답글 달기" 토글 클릭 → DS 가 해당 댓글 아래 인라인 입력을 연다. 그
    // 입력에 정확히 포커스를 맞춘다. stopPropagation 하지 않아 DS 의 열기
    // 동작은 그대로. 여기서 return 하면 아래 "삭제 행 클릭 차단"을 타지 않아,
    // 마지막 대댓글이 삭제돼 그 행에 "답글 달기" 가 달렸을 때도 답글을 열 수
    // 있다(DS 기본 replyButtonLabel 은 "답글 달기").
    const replyButton = target.closest('button');
    if (
      replyButton &&
      commentWrapperRef.current.contains(replyButton) &&
      replyButton.textContent?.trim() === '답글 달기'
    ) {
      const replyLi = replyButton.closest('li');
      if (replyLi) {
        focusReplyInputSoon(replyLi);
      }
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
