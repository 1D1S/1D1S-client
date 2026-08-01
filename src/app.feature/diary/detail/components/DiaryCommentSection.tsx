'use client';

import {
  Button,
  type CommentNode,
  CommentThread,
  Text,
  TextField,
} from '@1d1s/design-system';
import { MobileBottomActionBar } from '@component/layout/MobileBottomActionBar';
import { DiaryCommentsSkeleton } from '@component/skeletons/DiaryCommentsSkeleton';
import { cn } from '@module/utils/cn';
import React, { useEffect, useRef, useState } from 'react';

import { useCommentThreadDelegation } from '../hooks/useCommentThreadDelegation';
import { useCommentTree } from '../hooks/useCommentTree';
import {
  useCreateCommentReply,
  useCreateDiaryComment,
  useDeleteComment,
} from '../hooks/useDiaryCommentMutations';
import { CommentReportDialog } from './CommentReportDialog';

// 모바일에서 입력창(댓글·대댓글)이 키보드에 가리지 않게, 포커스 시 해당
// 요소를 뷰포트 안으로 스크롤한다. React onFocus 는 버블링되므로 상위 래퍼
// 한 곳에 달면 내부 DS CommentThread 의 대댓글 입력까지 함께 처리된다.
//
// 타이밍: 키보드로 visualViewport 가 줄어든 "뒤"에 계산해야 정확히 키보드 위로
// 올라온다. iOS 웹뷰는 키보드가 떠도 레이아웃을 리사이즈하지 않아, 한 번만
// 스크롤하면 이후 키보드 show/hide/전환에서 다시 가려진다. → 포커스 동안
// visualViewport 'resize'(키보드 높이 변동)를 계속 구독해 그때마다 입력을 다시
// 보이게 유지하고, blur 에서 정리한다. 초기 1회 폴백도 둔다.
function handleCommentInputFocus(event: React.FocusEvent<HTMLElement>): void {
  const target = event.target;
  if (
    !(target instanceof HTMLTextAreaElement) &&
    !(target instanceof HTMLInputElement)
  ) {
    return;
  }
  // 하단 고정 메인 composer(모바일 바/데스크톱)는 useKeyboardInsetOffset 로
  // 이미 키보드 위에 고정된다. 여기에 scrollIntoView 를 걸면 고정 바를 기준으로
  // 페이지가 재배치돼 섹션이 흘러내리듯 보인다(버그2). scrollIntoView 보정은
  // DS 인라인 답글 입력에만 적용하고 메인 composer 는 제외한다.
  if (
    target.id === 'diary-comment-content' ||
    target.id === 'diary-comment-content-mobile'
  ) {
    return;
  }
  const scrollIntoView = (): void => {
    target.scrollIntoView({ block: 'center', behavior: 'smooth' });
  };
  const vv = window.visualViewport;
  if (!vv) {
    window.setTimeout(scrollIntoView, 300);
    return;
  }
  // 리사이즈가 몰아칠 때 rAF 로 합쳐 한 프레임에 한 번만 스크롤한다.
  let raf = 0;
  const onViewportResize = (): void => {
    window.cancelAnimationFrame(raf);
    raf = window.requestAnimationFrame(scrollIntoView);
  };
  vv.addEventListener('resize', onViewportResize);
  const cleanup = (): void => {
    vv.removeEventListener('resize', onViewportResize);
    target.removeEventListener('blur', cleanup);
    window.cancelAnimationFrame(raf);
  };
  target.addEventListener('blur', cleanup, { once: true });
  // 키보드가 올라와 resize 가 온 뒤 정확히 보이도록 + resize 가 안 오는 환경
  // 대비 초기 1회 보정.
  window.setTimeout(scrollIntoView, 300);
}

const COMMENT_PLACEHOLDER = '응원의 말을 남겨주세요';

interface DiaryCommentSectionProps {
  diaryId: number;
  currentMemberId: number | null;
  currentUserNickname: string | null;
  isLoggedIn: boolean;
  onRequireLogin(): void;
}

export function DiaryCommentSection({
  diaryId,
  currentMemberId,
  currentUserNickname,
  isLoggedIn,
  onRequireLogin,
}: DiaryCommentSectionProps): React.ReactElement {
  const [commentContent, setCommentContent] = useState('');
  const [reportTargetCommentId, setReportTargetCommentId] = useState<
    number | null
  >(null);

  const {
    threadComments,
    flatCommentAuthors,
    flatCommentMeta,
    deletedCommentIds,
    replyTargetRootIdMap,
    totalCommentCount,
    isCommentsLoading,
    isCommentsError,
  } = useCommentTree(diaryId, currentMemberId, currentUserNickname);
  const { commentWrapperRef, handleCommentWrapperClickCapture } =
    useCommentThreadDelegation({ flatCommentAuthors, flatCommentMeta });

  const createComment = useCreateDiaryComment(diaryId);
  const createReply = useCreateCommentReply(diaryId);
  const deleteComment = useDeleteComment(diaryId);
  const isCommentPending =
    createComment.isPending || createReply.isPending || deleteComment.isPending;
  const isCommentSubmittingRef = useRef(false);

  const requireAuthAction = (action: () => void): void => {
    if (!isLoggedIn) {
      onRequireLogin();
      return;
    }
    action();
  };

  const handleCreateComment = (): void => {
    const content = commentContent.trim();
    if (!content || isCommentPending || isCommentSubmittingRef.current) {
      return;
    }

    requireAuthAction(() => {
      isCommentSubmittingRef.current = true;
      createComment.mutate(
        { content },
        {
          onSuccess: () => setCommentContent(''),
          onSettled: () => {
            isCommentSubmittingRef.current = false;
          },
        }
      );
    });
  };

  const handleReplySubmit = (comment: CommentNode, content: string): void => {
    const clickedCommentId = Number(comment.id);
    const trimmedContent = content.trim();

    if (!Number.isFinite(clickedCommentId) || clickedCommentId <= 0) {
      return;
    }

    if (!trimmedContent || isCommentPending) {
      return;
    }

    // 답글은 항상 루트(원댓글)에 달린다. 클릭한 노드가 아니라 실제 타겟인
    // 루트의 삭제 여부로 막는다 — 마지막 대댓글이 삭제돼 그 행에서 "답글 달기"
    // 를 눌러도(루트는 살아있음) 답글이 정상 등록되게 한다.
    const rootCommentId =
      replyTargetRootIdMap.get(clickedCommentId) ?? clickedCommentId;

    if (deletedCommentIds.has(rootCommentId)) {
      return;
    }

    requireAuthAction(() => {
      createReply.mutate({
        commentId: rootCommentId,
        content: trimmedContent,
      });
    });
  };

  const handleDeleteComment = (comment: CommentNode): void => {
    const targetCommentId = Number(comment.id);

    if (!Number.isFinite(targetCommentId) || targetCommentId <= 0) {
      return;
    }

    if (!window.confirm('댓글을 삭제하시겠습니까?')) {
      return;
    }

    requireAuthAction(() => {
      deleteComment.mutate(targetCommentId);
    });
  };

  const handleReportComment = (comment: CommentNode): void => {
    const targetCommentId = Number(comment.id);

    if (!Number.isFinite(targetCommentId) || targetCommentId <= 0) {
      return;
    }

    if (deletedCommentIds.has(targetCommentId)) {
      return;
    }

    requireAuthAction(() => {
      setReportTargetCommentId(targetCommentId);
    });
  };

  return (
    <div
      data-diary-comments
      onFocus={handleCommentInputFocus}
      className={cn(
        'lg:rounded-[14px] lg:border lg:border-gray-200 lg:bg-white',
        'lg:sticky lg:top-[78px]'
      )}
    >
      <div className="comment-readable lg:p-5">
        <Text size="body1" weight="bold" className="mb-3 block text-gray-900">
          응원 댓글 {totalCommentCount}개
        </Text>

        {isCommentsLoading ? (
          <DiaryCommentsSkeleton />
        ) : isCommentsError ? (
          <Text size="caption1" weight="regular" className="text-red-600">
            댓글을 불러오지 못했습니다.
          </Text>
        ) : threadComments.length === 0 ? (
          <Text size="caption1" weight="regular" className="text-gray-500">
            첫 댓글을 남겨보세요.
          </Text>
        ) : (
          <div
            ref={commentWrapperRef}
            onClickCapture={handleCommentWrapperClickCapture}
            className={cn(
              'data-fade-in',
              "[&_[data-slot='circle-avatar']]:cursor-pointer"
            )}
          >
            <CommentThread
              comments={threadComments}
              currentUserId={
                currentMemberId !== null ? String(currentMemberId) : undefined
              }
              onReplySubmit={handleReplySubmit}
              onDelete={handleDeleteComment}
              onReport={handleReportComment}
              className={cn(
                '[&_button]:shrink-0 [&_button]:whitespace-nowrap',
                '[&_ul]:!pl-1.5'
                // 대댓글 입력 폭/높이 스톱갭은 제거했다: DS 2.11.1 이 근본적으로
                // rows:2 + min-h + 폭(min-w-0) 을 처리한다. 클라 min-h-[44px] 는
                // 오히려 DS 의 더 큰 min-h 를 깎아 충돌하므로 남기지 않는다.
              )}
            />
          </div>
        )}

        <CommentReportDialog
          commentId={reportTargetCommentId}
          open={reportTargetCommentId !== null}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setReportTargetCommentId(null);
            }
          }}
        />

        <div className="mt-3 hidden items-end gap-1.5 sm:flex">
          <TextField
            id="diary-comment-content"
            size="sm"
            multiline
            rows={2}
            className="flex-1"
            value={commentContent}
            onChange={(event) => setCommentContent(event.target.value)}
            placeholder={COMMENT_PLACEHOLDER}
          />
          <Button
            size="sm"
            className="shrink-0 whitespace-nowrap"
            onClick={handleCreateComment}
            disabled={isCommentPending || !commentContent.trim()}
          >
            등록
          </Button>
        </div>
      </div>
    </div>
  );
}

interface DiaryMobileCommentBarProps {
  diaryId: number;
  isLoggedIn: boolean;
  onRequireLogin(): void;
}

export function DiaryMobileCommentBar({
  diaryId,
  isLoggedIn,
  onRequireLogin,
}: DiaryMobileCommentBarProps): React.ReactElement {
  const [content, setContent] = useState('');
  const createComment = useCreateDiaryComment(diaryId);
  const disabled = createComment.isPending || !content.trim();
  const isSubmittingRef = useRef(false);

  // DS 인라인 답글 입력이 열리면 이 고정 메인 입력바를 숨긴다 — 안 그러면
  // 답글 입력과 메인 입력바가 겹쳐 보인다(증상B). DS 2.11.2 는 열린 답글 입력
  // 에만 `[data-reply-input]` 을 달므로(닫힌 입력은 inert) 그 존재 = 답글 열림.
  // MutationObserver 로 열림/닫힘을 반영한다.
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  useEffect(() => {
    const root = document.querySelector('[data-diary-comments]');
    if (!root) {
      return;
    }
    const check = (): void => {
      setIsReplyOpen(root.querySelector('[data-reply-input]') !== null);
    };
    check();
    const observer = new MutationObserver(check);
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  const handleSubmit = (): void => {
    if (!isLoggedIn) {
      onRequireLogin();
      return;
    }
    if (disabled || isSubmittingRef.current) {
      return;
    }
    isSubmittingRef.current = true;
    createComment.mutate(
      { content: content.trim() },
      {
        onSuccess: () => setContent(''),
        onSettled: () => {
          isSubmittingRef.current = false;
        },
      }
    );
  };

  return (
    <MobileBottomActionBar
      hidden={isReplyOpen}
      className={cn(
        'comment-readable flex items-end gap-2 bg-white px-4 pt-2.5',
        'sm:hidden'
      )}
    >
      <TextField
        id="diary-comment-content-mobile"
        size="sm"
        multiline
        rows={2}
        className="flex-1"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="응원의 말을 남겨주세요"
      />
      <Button
        size="sm"
        className="shrink-0 whitespace-nowrap"
        onClick={handleSubmit}
        disabled={disabled}
      >
        등록
      </Button>
    </MobileBottomActionBar>
  );
}
