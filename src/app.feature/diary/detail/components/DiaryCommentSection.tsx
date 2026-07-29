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
import React, { useRef, useState } from 'react';

import { useCommentThreadDelegation } from '../hooks/useCommentThreadDelegation';
import { useCommentTree } from '../hooks/useCommentTree';
import {
  useCreateCommentReply,
  useCreateDiaryComment,
  useDeleteComment,
} from '../hooks/useDiaryCommentMutations';
import { CommentReportDialog } from './CommentReportDialog';

// 모바일에서 입력창(댓글·대댓글)이 키보드에 가리지 않게, 포커스 시 해당
// 요소를 뷰포트 안으로 스크롤한다. 키보드가 올라오며 visualViewport 가 줄어드는
// 데 시간이 걸려 약간 지연 후 실행한다. React onFocus 는 버블링되므로 상위
// 래퍼 한 곳에 달면 내부 DS CommentThread 의 대댓글 입력까지 함께 처리된다.
// (그래도 가려지면 웹뷰 리사이즈가 필요 — 앱 세션 병행.)
function handleCommentInputFocus(event: React.FocusEvent<HTMLElement>): void {
  const target = event.target;
  if (
    !(target instanceof HTMLTextAreaElement) &&
    !(target instanceof HTMLInputElement)
  ) {
    return;
  }
  window.setTimeout(() => {
    target.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, 300);
}

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

    if (deletedCommentIds.has(clickedCommentId)) {
      return;
    }

    if (!trimmedContent || isCommentPending) {
      return;
    }

    const rootCommentId =
      replyTargetRootIdMap.get(clickedCommentId) ?? clickedCommentId;

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
                '[&_ul]:!pl-1.5',
                // 대댓글 입력창이 좁게 보이던 문제 — 스레드 내 textarea(=대댓글
                // 입력, DS 내부)를 폭 꽉 채우고 최소 높이를 확보하는 클라이언트
                // 스톱갭. 근본 크기(rows/기본폭)는 DS CommentThread 소관(보고).
                '[&_textarea]:w-full [&_textarea]:min-w-0',
                '[&_textarea]:min-h-[44px]'
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
            placeholder="응원의 말을 남겨주세요"
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
        onFocus={handleCommentInputFocus}
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
