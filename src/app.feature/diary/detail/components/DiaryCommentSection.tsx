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
import { useNativeCapability } from '@module/hooks/useNativeCapability';
import { cn } from '@module/utils/cn';
import {
  isNativeCommentInputAvailable,
  isNativeCommentSheetAvailable,
  onNativeCommentReplyCancel,
  onNativeCommentSubmit,
  sendNativeCommentContext,
  sendNativeCommentSheetOpen,
} from '@module/utils/nativeBridge';
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
// 올라온다. 즉시 호출하면 아직 안 줄어든 뷰포트 기준이라 어긋난다. → 다음
// visualViewport resize 를 1회 기다렸다가 scrollIntoView 하고, 리사이즈가
// 안 오는 환경을 위해 타임아웃 폴백을 둔다.
function handleCommentInputFocus(event: React.FocusEvent<HTMLElement>): void {
  const target = event.target;
  if (
    !(target instanceof HTMLTextAreaElement) &&
    !(target instanceof HTMLInputElement)
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
  let done = false;
  const run = (): void => {
    if (done) {
      return;
    }
    done = true;
    vv.removeEventListener('resize', run);
    scrollIntoView();
  };
  vv.addEventListener('resize', run);
  // 키보드가 이미 떠 있어 resize 가 안 오는 경우 대비 폴백.
  window.setTimeout(run, 350);
}

const COMMENT_PLACEHOLDER = '응원의 말을 남겨주세요';

interface DiaryCommentSectionProps {
  diaryId: number;
  // 앱에서 상세 본문에 놓일 때 true — 목록·입력을 그리지 않고 "댓글 N개 보기"
  // 버튼만 둔다. 목록은 네이티브 바텀시트(/diary/{id}/comments)가 맡는다.
  sheetEntryOnly?: boolean;
  currentMemberId: number | null;
  currentUserNickname: string | null;
  isLoggedIn: boolean;
  onRequireLogin(): void;
}

export function DiaryCommentSection({
  diaryId,
  sheetEntryOnly = false,
  currentMemberId,
  currentUserNickname,
  isLoggedIn,
  onRequireLogin,
}: DiaryCommentSectionProps): React.ReactElement {
  const [commentContent, setCommentContent] = useState('');
  const [reportTargetCommentId, setReportTargetCommentId] = useState<
    number | null
  >(null);

  // 앱(웹뷰)에선 댓글 입력을 네이티브 입력바로 위임한다(8-2). 답글 대상은
  // 웹이 관리해 context 로 전달한다(parentId=루트 댓글, replyingTo=표시명).
  // native:ready 로 comment_input 피처가 늦게 주입돼도 재평가되도록 반응형.
  const commentNativeActive = useNativeCapability(
    isNativeCommentInputAvailable
  );
  // 셸이 댓글 시트를 지원하는지. 지원 안 하는 구버전 앱에서는 버튼만 두면
  // 눌러도 아무 일이 없으므로, 기존처럼 인라인 목록을 그대로 그린다.
  const commentSheetActive = useNativeCapability(isNativeCommentSheetAvailable);
  // 상세 본문의 진입 버튼 모드에서는 입력 자체를 위임하지 않는다. 위임하면
  // 목록도 입력창도 없는 화면 아래에 네이티브 입력 바만 덩그러니 남는다 —
  // 댓글은 시트 안에서만 단다.
  const delegateInput =
    commentNativeActive && !(sheetEntryOnly && commentSheetActive);
  const [replyTarget, setReplyTarget] = useState<{
    parentId: number;
    replyingTo: string;
  } | null>(null);

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
    useCommentThreadDelegation({
      flatCommentAuthors,
      flatCommentMeta,
      replyTargetRootIdMap,
      nativeReplyActive: commentNativeActive,
      onNativeReplyStart: (parentId, replyingTo) =>
        setReplyTarget({ parentId, replyingTo }),
    });

  const createComment = useCreateDiaryComment(diaryId);
  const createReply = useCreateCommentReply(diaryId);
  const deleteComment = useDeleteComment(diaryId);
  const isCommentPending =
    createComment.isPending || createReply.isPending || deleteComment.isPending;
  const isCommentSubmittingRef = useRef(false);

  // ── 네이티브 댓글 입력 위임 (commentNativeActive 일 때만) ──────────────
  // 최신 상태를 참조하도록 제출 핸들러를 ref 로 유지(구독은 1회).
  const nativeSubmitRef = useRef<
    (payload: { text: string; parentId: number | null }) => void
  >(() => {});
  useEffect(() => {
    nativeSubmitRef.current = ({ text, parentId }): void => {
      const content = text.trim();
      if (!content || isCommentPending) {
        return;
      }
      if (!isLoggedIn) {
        onRequireLogin();
        return;
      }
      const options = {
        onSuccess: (): void => {
          setReplyTarget(null);
          // 전송 성공 시에만 입력을 비운다(실패 시 보존).
          sendNativeCommentContext({
            visible: true,
            placeholder: COMMENT_PLACEHOLDER,
            parentId: null,
            replyingTo: null,
            clear: true,
          });
        },
      };
      if (parentId) {
        createReply.mutate({ commentId: parentId, content }, options);
      } else {
        createComment.mutate({ content }, options);
      }
    };
  });

  // 입력 컨텍스트 전송: 마운트·답글 시작/취소(replyTarget)·전송중(pending)
  // 변화마다 재전송. 전송 실패 시 pending 이 false 로 돌아오며 submitting:false
  // 가 재전송돼 앱 입력이 다시 활성화된다(내용은 그대로).
  useEffect(() => {
    if (!delegateInput) {
      return;
    }
    sendNativeCommentContext({
      visible: true,
      placeholder: replyTarget
        ? `${replyTarget.replyingTo}님에게 답글 남기기`
        : COMMENT_PLACEHOLDER,
      parentId: replyTarget?.parentId ?? null,
      replyingTo: replyTarget?.replyingTo ?? null,
      submitting: isCommentPending,
    });
  }, [delegateInput, replyTarget, isCommentPending]);

  // 화면을 벗어나면 네이티브 입력을 해제한다.
  useEffect(() => {
    if (!delegateInput) {
      return;
    }
    return () => sendNativeCommentContext({ visible: false });
  }, [delegateInput]);

  // 앱→웹 제출 수신 → 댓글/대댓글 생성. 답글 취소 → 최상위로 복귀.
  useEffect(() => {
    if (!delegateInput) {
      return;
    }
    const offSubmit = onNativeCommentSubmit((payload) =>
      nativeSubmitRef.current(payload)
    );
    const offCancel = onNativeCommentReplyCancel(() => setReplyTarget(null));
    return () => {
      offSubmit();
      offCancel();
    };
  }, [delegateInput]);

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

  // 앱 상세 본문 — 목록 대신 진입 버튼만. 목록·입력은 시트가 맡는다.
  if (sheetEntryOnly && commentSheetActive) {
    return (
      <button
        type="button"
        onClick={() => sendNativeCommentSheetOpen(`/diary/${diaryId}/comments`)}
        className={cn(
          'flex w-full items-center justify-between rounded-[14px]',
          'border border-gray-200 bg-white px-4 py-3.5 text-left',
          'active:bg-gray-50'
        )}
      >
        <Text size="body1" weight="bold" className="text-gray-900">
          응원 댓글 {totalCommentCount}개
        </Text>
        <Text size="caption1" weight="medium" className="text-gray-500">
          {totalCommentCount === 0 ? '첫 댓글 남기기' : '전체 보기'} ›
        </Text>
      </button>
    );
  }

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

        {/* 앱: 데스크톱 입력창도 네이티브로 위임되면 숨긴다(태블릿 웹뷰 대비). */}
        {!delegateInput && (
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
        )}
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
  // 앱(웹뷰)에선 네이티브 입력바가 대신 뜨므로 웹 입력바를 숨긴다(8-2).
  // 시트를 지원하는 셸에서는 상세 본문에 입력바 자체를 두지 않는다 — 입력은
  // 시트 안에서 한다.
  const commentNativeActive = useNativeCapability(
    isNativeCommentInputAvailable
  );
  const commentSheetActive = useNativeCapability(isNativeCommentSheetAvailable);
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
      hidden={commentNativeActive || commentSheetActive}
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
