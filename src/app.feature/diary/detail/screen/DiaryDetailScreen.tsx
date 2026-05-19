'use client';

import {
  Button,
  type CommentNode,
  CommentThread,
  Text,
  TextField,
} from '@1d1s/design-system';
import { LoginRequiredDialog } from '@component/LoginRequiredDialog';
import { DiaryCommentsSkeleton } from '@component/skeletons/DiaryCommentsSkeleton';
import { DiaryDetailSkeleton } from '@component/skeletons/DiaryDetailSkeleton';
import { normalizeApiError } from '@module/api/error';
import { cn } from '@module/utils/cn';
import { useIsMobileWebApp } from '@module/utils/userAgent';
import {
  ArrowLeft,
  Edit3,
  Flag,
  Heart,
  MessageCircle,
  MoreVertical,
  Share2,
  Trash2,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useChallengeDetail } from '../../../challenge/board/hooks/useChallengeQueries';
import { useIsLoggedIn } from '../../../member/hooks/useIsLoggedIn';
import { useSidebar } from '../../../member/hooks/useMemberQueries';
import { useDiaryDetail } from '../../board/hooks/useDiaryQueries';
import { DiaryContentRenderer } from '../../shared/components/DiaryContentRenderer';
import { DiaryAuthorRow } from '../components/DiaryAuthorRow';
import {
  DiaryConnectedChallengeCard,
  DiaryConnectedChallengeFallback,
} from '../components/DiaryConnectedChallenge';
import { DiaryGoalsCard } from '../components/DiaryGoalsCard';
import {
  DiaryHeroImage,
  DiaryImageLightbox,
} from '../components/DiaryHeroImage';
import { DiaryReportDialog } from '../components/DiaryReportDialog';
import {
  useCreateCommentReply,
  useCreateDiaryComment,
  useDeleteComment,
} from '../hooks/useDiaryCommentMutations';
import {
  useCommentRepliesMap,
  useDiaryComments,
} from '../hooks/useDiaryCommentQueries';
import {
  useDeleteDiary,
  useLikeDiary,
  useUnlikeDiary,
} from '../hooks/useDiaryMutations';
import { DiaryComment } from '../type/comment';
import {
  type DiaryDetailViewData,
  formatCommentDateTime,
  getAuthorInfo,
  mapDiaryToViewData,
  resolveSidebarMemberId,
  sortCommentsByOldest,
} from '../utils/diaryViewData';

const COMMENT_LIST_PARAMS = { page: 0, size: 10 } as const;
const REPLIES_MAP_PARAMS = { page: 0, size: 10 } as const;

function DiaryActionToolbar({
  diaryData,
  totalCommentCount,
  isLikePending,
  onLikeToggle,
  onShare,
}: {
  diaryData: DiaryDetailViewData;
  totalCommentCount: number;
  isLikePending: boolean;
  onLikeToggle(): void;
  onShare(): void;
}): React.ReactElement {
  return (
    <div className="mt-1 flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onLikeToggle}
        disabled={isLikePending}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border px-4 py-2',
          'text-[13px] font-bold transition-colors disabled:opacity-60',
          diaryData.likedByMe
            ? 'border-main-800 bg-main-100 text-main-800'
            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
        )}
      >
        <Heart
          className={cn(
            'h-3.5 w-3.5',
            diaryData.likedByMe && 'fill-current'
          )}
        />
        좋아요 {diaryData.likeCount}
      </button>
      <button
        type="button"
        onClick={onShare}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border px-4 py-2',
          'border-gray-200 bg-white text-[13px] font-bold text-gray-700',
          'transition-colors hover:bg-gray-50'
        )}
      >
        <Share2 className="h-3.5 w-3.5" />
        공유
      </button>
      <div className="ml-auto flex items-center gap-1 text-gray-500">
        <MessageCircle className="h-4 w-4" />
        <Text size="caption1" weight="medium" className="text-gray-500">
          댓글 {totalCommentCount}
        </Text>
      </div>
    </div>
  );
}

function DiaryOwnerMenu({
  onEdit,
  onDelete,
}: {
  onEdit(): void;
  onDelete(): void;
}): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handleClickOutside = (event: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={menuRef} className="relative">
      <Button
        variant="outlined"
        size="medium"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <MoreVertical className="h-4 w-4" />
      </Button>
      {isOpen ? (
        <div
          className={cn(
            'absolute top-full right-0 z-10 mt-1 w-32',
            'overflow-hidden rounded-lg border border-gray-200',
            'bg-white shadow-md'
          )}
        >
          <button
            type="button"
            className={cn(
              'flex w-full cursor-pointer items-center gap-2',
              'px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50'
            )}
            onClick={() => {
              setIsOpen(false);
              onEdit();
            }}
          >
            <Edit3 className="h-4 w-4" />
            일지 수정
          </button>
          <button
            type="button"
            className={cn(
              'flex w-full cursor-pointer items-center gap-2',
              'px-4 py-2.5 text-left text-sm text-red-500 hover:bg-gray-50'
            )}
            onClick={() => {
              setIsOpen(false);
              onDelete();
            }}
          >
            <Trash2 className="h-4 w-4" />
            일지 삭제
          </button>
        </div>
      ) : null}
    </div>
  );
}

interface DiaryCommentSectionProps {
  diaryId: number;
  currentMemberId: number | null;
  currentUserNickname: string | null;
  isLoggedIn: boolean;
  onRequireLogin(): void;
}

function DiaryCommentSection({
  diaryId,
  currentMemberId,
  currentUserNickname,
  isLoggedIn,
  onRequireLogin,
}: DiaryCommentSectionProps): React.ReactElement {
  const router = useRouter();
  const commentWrapperRef = useRef<HTMLDivElement>(null);
  const [commentContent, setCommentContent] = useState('');
  const {
    data: commentsData,
    isLoading: isCommentsLoading,
    isError: isCommentsError,
  } = useDiaryComments(diaryId, COMMENT_LIST_PARAMS);
  const commentItems = useMemo(
    () => sortCommentsByOldest(commentsData?.items ?? []),
    [commentsData?.items]
  );
  const commentIds = useMemo(
    () => commentItems.map((comment) => comment.id),
    [commentItems]
  );
  const repliesMapParams = useMemo(
    () => ({ ...REPLIES_MAP_PARAMS, enabled: commentIds.length > 0 }),
    [commentIds.length]
  );
  const { data: commentRepliesMap = {} } = useCommentRepliesMap(
    commentIds,
    repliesMapParams
  );
  const createComment = useCreateDiaryComment(diaryId);
  const createReply = useCreateCommentReply(diaryId);
  const deleteComment = useDeleteComment(diaryId);
  const isCommentPending =
    createComment.isPending || createReply.isPending || deleteComment.isPending;

  const mapCommentNode = useCallback(
    (comment: DiaryComment): CommentNode => {
      const authorNickname = comment.author.nickname?.trim();

      return {
        id: String(comment.id),
        content: comment.content || '삭제된 댓글입니다.',
        createdAt: formatCommentDateTime(comment.createdAt),
        author: {
          id: String(comment.author.id),
          nickname: comment.author.nickname || '익명',
          profileImageUrl: comment.author.profileImage ?? undefined,
        },
        isAuthor:
          (currentMemberId !== null &&
            comment.author.id === currentMemberId) ||
          (currentMemberId === null &&
            Boolean(authorNickname) &&
            Boolean(currentUserNickname) &&
            authorNickname === currentUserNickname),
      };
    },
    [currentUserNickname, currentMemberId]
  );

  const threadComments = useMemo<CommentNode[]>(
    () =>
      commentItems.map((comment) => ({
        ...mapCommentNode(comment),
        replies: sortCommentsByOldest(commentRepliesMap[comment.id] ?? []).map(
          mapCommentNode
        ),
      })),
    [commentItems, commentRepliesMap, mapCommentNode]
  );

  // DS CommentThread는 onAvatarClick 같은 prop을 노출하지 않아 이벤트 위임으로
  // 처리. CommentThread 내부 아바타에 붙어 있는 `data-slot="circle-avatar"`
  // 속성을 후크로 사용하고, 클릭된 아바타의 인덱스(DFS 순서) → flatCommentAuthors
  // 매핑으로 멤버 ID 를 결정한다. DS 의 data-slot 또는 렌더 순서가 바뀌면 함께
  // 업데이트해야 한다.
  const flatCommentAuthors = useMemo<Array<{ id: string }>>(() => {
    const out: Array<{ id: string }> = [];
    const walk = (nodes: CommentNode[]): void => {
      for (const node of nodes) {
        out.push({ id: node.author.id });
        if (node.replies && node.replies.length > 0) {
          walk(node.replies);
        }
      }
    };
    walk(threadComments);
    return out;
  }, [threadComments]);

  // threadComments 와 동일한 DFS 순서로 원본 comment 메타(id, isDeleted)를
  // 평탄화. DS 가 comment 당 <li> 하나를 렌더하므로 querySelectorAll('li') 의
  // 문서 순서와 일치한다.
  const flatCommentMeta = useMemo<
    Array<{ id: number; isDeleted: boolean }>
  >(() => {
    const out: Array<{ id: number; isDeleted: boolean }> = [];
    for (const comment of commentItems) {
      out.push({ id: comment.id, isDeleted: comment.isDeleted });
      const replies = sortCommentsByOldest(
        commentRepliesMap[comment.id] ?? []
      );
      for (const reply of replies) {
        out.push({ id: reply.id, isDeleted: reply.isDeleted });
      }
    }
    return out;
  }, [commentItems, commentRepliesMap]);

  const deletedCommentIds = useMemo<Set<number>>(() => {
    const ids = new Set<number>();
    for (const meta of flatCommentMeta) {
      if (meta.isDeleted) {
        ids.add(meta.id);
      }
    }
    return ids;
  }, [flatCommentMeta]);

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
    const allLis = Array.from(
      commentWrapperRef.current.querySelectorAll('li')
    );
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
  const totalCommentCount = useMemo(() => {
    const baseCommentCount = commentsData?.pageInfo.totalElements ?? 0;
    const totalReplyCount = commentItems.reduce(
      (accumulator, comment) =>
        accumulator +
        (comment.replyCount > 0
          ? comment.replyCount
          : (commentRepliesMap[comment.id]?.length ?? 0)),
      0
    );

    return baseCommentCount + totalReplyCount;
  }, [commentItems, commentRepliesMap, commentsData?.pageInfo.totalElements]);

  const requireAuthAction = (action: () => void): void => {
    if (!isLoggedIn) {
      onRequireLogin();
      return;
    }
    action();
  };

  const handleCreateComment = (): void => {
    const content = commentContent.trim();
    if (!content || isCommentPending) {
      return;
    }

    requireAuthAction(() => {
      createComment.mutate(
        { content },
        {
          onSuccess: () => setCommentContent(''),
        }
      );
    });
  };

  const handleReplySubmit = (comment: CommentNode, content: string): void => {
    const targetCommentId = Number(comment.id);
    const trimmedContent = content.trim();

    if (!Number.isFinite(targetCommentId) || targetCommentId <= 0) {
      return;
    }

    if (deletedCommentIds.has(targetCommentId)) {
      return;
    }

    if (!trimmedContent || isCommentPending) {
      return;
    }

    requireAuthAction(() => {
      createReply.mutate({
        commentId: targetCommentId,
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

  return (
    <div
      className={cn(
        'lg:rounded-[14px] lg:border lg:border-gray-200 lg:bg-white',
        'lg:sticky lg:top-5'
      )}
    >
      <div className="lg:p-5">
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
              className={cn(
                '[&_button]:shrink-0 [&_button]:whitespace-nowrap',
                '[&_ul]:!pl-1.5'
              )}
            />
          </div>
        )}

        <div className="mt-3 hidden items-end gap-1.5 lg:flex">
          <TextField
            id="diary-comment-content"
            size="sm"
            multiline
            rows={2}
            className="flex-1"
            value={commentContent}
            onChange={(event) => setCommentContent(event.target.value)}
            placeholder="응원의 말을 남겨주세요"
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                handleCreateComment();
              }
            }}
          />
          <Button
            size="small"
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

function DiaryMobileCommentBar({
  diaryId,
  isLoggedIn,
  onRequireLogin,
}: {
  diaryId: number;
  isLoggedIn: boolean;
  onRequireLogin(): void;
}): React.ReactElement {
  const [content, setContent] = useState('');
  const createComment = useCreateDiaryComment(diaryId);
  const disabled = createComment.isPending || !content.trim();
  const isMobileWebApp = useIsMobileWebApp();

  const handleSubmit = (): void => {
    if (!isLoggedIn) {
      onRequireLogin();
      return;
    }
    if (disabled) {
      return;
    }
    createComment.mutate(
      { content: content.trim() },
      { onSuccess: () => setContent('') }
    );
  };

  return (
    <div
      className={cn(
        'fixed right-0 bottom-0 left-0 z-20 lg:hidden',
        'border-t border-gray-100 bg-white',
        'flex items-end gap-2 px-4 pt-2.5',
        isMobileWebApp
          ? 'pb-[calc(0.625rem+env(safe-area-inset-bottom))]'
          : 'pb-2.5'
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
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSubmit();
          }
        }}
      />
      <Button
        size="small"
        className="shrink-0 whitespace-nowrap"
        onClick={handleSubmit}
        disabled={disabled}
      >
        등록
      </Button>
    </div>
  );
}

function DiaryDetailView({
  diaryData,
  onLikeToggle,
  isLikePending,
  isOwner,
  onDelete,
  onRequireLogin,
}: {
  diaryData: DiaryDetailViewData;
  onLikeToggle(): void;
  isLikePending: boolean;
  isOwner: boolean;
  onDelete(): void;
  onRequireLogin(): void;
}): React.ReactElement {
  const router = useRouter();
  const { data: sidebarData } = useSidebar();
  const isLoggedIn = useIsLoggedIn();
  const isMobileWebApp = useIsMobileWebApp();
  const currentMemberId = useMemo(
    () => resolveSidebarMemberId(sidebarData),
    [sidebarData]
  );
  const currentUserNickname = useMemo(
    () => sidebarData?.nickname?.trim() ?? null,
    [sidebarData?.nickname]
  );
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const { data: commentsData } = useDiaryComments(
    diaryData.id,
    COMMENT_LIST_PARAMS
  );
  const previewCommentIds = useMemo(
    () => commentsData?.items?.map((comment) => comment.id) ?? [],
    [commentsData?.items]
  );
  const previewRepliesMapParams = useMemo(
    () => ({
      ...REPLIES_MAP_PARAMS,
      enabled: previewCommentIds.length > 0,
    }),
    [previewCommentIds.length]
  );
  const { data: commentRepliesMap = {} } = useCommentRepliesMap(
    previewCommentIds,
    previewRepliesMapParams
  );
  const totalCommentCount = useMemo(() => {
    const baseCommentCount = commentsData?.pageInfo.totalElements ?? 0;
    const totalReplyCount = (commentsData?.items ?? []).reduce(
      (accumulator, comment) =>
        accumulator +
        (comment.replyCount > 0
          ? comment.replyCount
          : (commentRepliesMap[comment.id]?.length ?? 0)),
      0
    );
    return baseCommentCount + totalReplyCount;
  }, [
    commentsData?.items,
    commentsData?.pageInfo.totalElements,
    commentRepliesMap,
  ]);

  useEffect(() => {
    if (!isImageOpen) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setIsImageOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isImageOpen]);

  const handleShare = async (): Promise<void> => {
    const shareUrl = window.location.href;

    if (navigator.share) {
      await navigator.share({
        title: diaryData.title,
        text: `${diaryData.title} 일지를 공유합니다.`,
        url: shareUrl,
      });
      return;
    }

    await navigator.clipboard.writeText(shareUrl);
  };

  const isHundredPercent = diaryData.achievementPercent === 100;

  return (
    <div
      className={cn(
        'min-h-screen w-full bg-white',
        isMobileWebApp
          ? 'pb-[calc(112px+env(safe-area-inset-bottom))]'
          : 'pb-[112px]',
        'lg:pb-0'
      )}
    >
      {/* 모바일 sticky 헤더 — ← + 일지 */}
      <div
        className={cn(
          'sticky top-0 z-30 flex h-14 items-center gap-3',
          'border-b border-gray-100 bg-white/95 px-4 backdrop-blur',
          'lg:hidden'
        )}
      >
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => router.back()}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg',
            'text-gray-700 transition-colors hover:bg-gray-100'
          )}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Text
          size="body1"
          weight="extrabold"
          className="flex-1 tracking-[-0.3px] text-gray-900"
        >
          일지
        </Text>
      </div>

      <div
        className={cn(
          'mx-auto w-full max-w-[1200px]',
          'px-4 py-3 sm:px-5 sm:py-7 lg:px-8 lg:py-10'
        )}
      >
        <div
          className={cn(
            'grid gap-4 lg:gap-7',
            'lg:grid-cols-[minmax(0,1fr)_320px]'
          )}
        >
          <article className="flex min-w-0 flex-col gap-3.5">
            {/* Card 1 — Author + actions */}
            <section
              className={cn(
                'flex items-center gap-3',
                'lg:rounded-[14px] lg:border lg:border-gray-200',
                'lg:bg-white lg:p-4'
              )}
            >
              <div className="min-w-0 flex-1">
                <DiaryAuthorRow
                  authorName={diaryData.authorName}
                  authorId={diaryData.authorId}
                  authorProfileImage={diaryData.authorProfileImage}
                  relativeDateLabel={diaryData.relativeDateLabel}
                />
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {!isOwner ? (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setIsReportOpen(true)}
                  >
                    <Flag className="mr-1 h-3.5 w-3.5" />
                    신고
                  </Button>
                ) : null}
                {isOwner ? (
                  <DiaryOwnerMenu
                    onEdit={() =>
                      router.push(`/diary/create?diaryId=${diaryData.id}`)
                    }
                    onDelete={onDelete}
                  />
                ) : null}
              </div>
            </section>

            <DiaryActionToolbar
              diaryData={diaryData}
              totalCommentCount={totalCommentCount}
              isLikePending={isLikePending}
              onLikeToggle={onLikeToggle}
              onShare={() => void handleShare()}
            />

            {/* 연동된 챌린지 카드 — 풀 리스트 아이템 */}
            {diaryData.connectedChallengeSummary &&
            diaryData.connectedChallengeId ? (
              <DiaryConnectedChallengeCard
                summary={diaryData.connectedChallengeSummary}
                onClick={() =>
                  router.push(`/challenge/${diaryData.connectedChallengeId}`)
                }
              />
            ) : (
              <DiaryConnectedChallengeFallback
                title={diaryData.connectedChallengeTitle}
              />
            )}

            {/* Card 2 — Title + Emotion meter */}
            <section
              className={cn(
                'lg:rounded-[14px] lg:border lg:border-gray-200',
                'lg:bg-white lg:p-6'
              )}
            >
              <Text
                as="h1"
                size="display1"
                weight="bold"
                className="block leading-[1.3] tracking-[-0.4px] text-gray-900"
              >
                {diaryData.title}
              </Text>

              {/* 모바일: 인라인 이모지 + 기분 라벨 + 달성 뱃지 */}
              <div className="mt-3 flex items-center gap-2 lg:hidden">
                {diaryData.feelingMoodImage ? (
                  <Image
                    src={diaryData.feelingMoodImage.src}
                    alt={diaryData.feelingMoodImage.alt}
                    width={20}
                    height={20}
                    className="h-5 w-5"
                  />
                ) : (
                  <span className="text-lg leading-none" aria-hidden>
                    {diaryData.feelingEmoji}
                  </span>
                )}
                <Text
                  size="caption1"
                  weight="medium"
                  className="text-gray-600"
                >
                  오늘의 기분 · {diaryData.feelingLabel}
                </Text>
                <span
                  className={cn(
                    'ml-auto inline-flex items-center rounded-full',
                    'px-2 py-0.5 text-[10px] font-extrabold text-white',
                    isHundredPercent ? 'bg-green-500' : 'bg-main-800'
                  )}
                >
                  {diaryData.achievementPercent}%
                </span>
              </div>

              {/* 데스크탑: gray-50 톤 emotion 메터 */}
              <div
                className={cn(
                  'mt-3.5 hidden flex-wrap items-center gap-2.5',
                  'rounded-[10px] bg-gray-50 px-3.5 py-2.5 lg:flex'
                )}
              >
                {diaryData.feelingMoodImage ? (
                  <Image
                    src={diaryData.feelingMoodImage.src}
                    alt={diaryData.feelingMoodImage.alt}
                    width={24}
                    height={24}
                    className="h-6 w-6"
                  />
                ) : (
                  <span className="text-xl leading-none" aria-hidden>
                    {diaryData.feelingEmoji}
                  </span>
                )}
                <Text
                  size="caption1"
                  weight="medium"
                  className="text-gray-600"
                >
                  오늘의 기분 · {diaryData.feelingLabel}
                </Text>
                <span
                  className={cn(
                    'ml-auto inline-flex items-center rounded-full',
                    'px-2.5 py-1 text-[10px] font-extrabold text-white',
                    isHundredPercent ? 'bg-green-500' : 'bg-main-800'
                  )}
                >
                  {diaryData.achievementPercent}% 달성
                </span>
              </div>
            </section>

            {/* Card 3 — Goals (DiaryGoalsCard is itself the card) */}
            <DiaryGoalsCard
              checklistItems={diaryData.checklistItems}
              checkedChecklistIds={diaryData.checkedChecklistIds}
            />

            {/* 모바일: 이미지 단독 블록 */}
            {diaryData.contentImageUrl ? (
              <div className="lg:hidden">
                <DiaryHeroImage
                  imageUrl={diaryData.contentImageUrl}
                  title={diaryData.title}
                  onOpen={() => setIsImageOpen(true)}
                />
              </div>
            ) : null}

            {/* Card 4 — Today's record (label + image + body) */}
            <section
              className={cn(
                'rounded-[14px] border border-gray-200 bg-white',
                'p-4 sm:p-5 lg:p-6'
              )}
            >
              <Text
                size="caption2"
                weight="extrabold"
                className={cn(
                  'block tracking-[0.4px] text-gray-500 uppercase'
                )}
              >
                오늘의 기록
              </Text>
              {diaryData.contentImageUrl ? (
                <div className="mt-3.5 hidden lg:block">
                  <DiaryHeroImage
                    imageUrl={diaryData.contentImageUrl}
                    title={diaryData.title}
                    onOpen={() => setIsImageOpen(true)}
                  />
                </div>
              ) : null}
              <div className="mt-4">
                {diaryData.hasContentHtml ? (
                  <DiaryContentRenderer
                    html={diaryData.contentHtml}
                    className="text-[15px] leading-[1.9]"
                  />
                ) : (
                  <Text
                    size="body2"
                    weight="regular"
                    className="text-gray-500"
                  >
                    작성된 내용이 없습니다.
                  </Text>
                )}
              </div>
            </section>
          </article>

          <aside>
            <DiaryCommentSection
              diaryId={diaryData.id}
              currentMemberId={currentMemberId}
              currentUserNickname={currentUserNickname}
              isLoggedIn={isLoggedIn}
              onRequireLogin={onRequireLogin}
            />
          </aside>
        </div>
      </div>

      {isImageOpen && diaryData.contentImageUrl ? (
        <DiaryImageLightbox
          imageUrl={diaryData.contentImageUrl}
          onClose={() => setIsImageOpen(false)}
        />
      ) : null}

      <DiaryReportDialog
        diaryId={diaryData.id}
        open={isReportOpen}
        onOpenChange={setIsReportOpen}
      />
    </div>
  );
}

export function DiaryDetailScreen({ id }: { id: number }): React.ReactElement {
  const router = useRouter();
  const isLoggedIn = useIsLoggedIn();
  const [dismissed, setDismissed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const showAuthDialog = !isLoggedIn && !dismissed;
  const safeDiaryId = Number.isFinite(id) && id > 0 ? id : 0;
  const deleteDiary = useDeleteDiary();
  const { data, isLoading, isError, error } = useDiaryDetail(safeDiaryId, {
    enabled: Boolean(safeDiaryId) && !isDeleting,
  });
  const likeDiary = useLikeDiary();
  const unlikeDiary = useUnlikeDiary();
  const challengeId = data?.challenge?.challengeId ?? 0;
  const { data: challengeDetailData } = useChallengeDetail(challengeId);
  const { data: sidebarData } = useSidebar();
  const isLikePending = likeDiary.isPending || unlikeDiary.isPending;
  const authorInfo = data ? getAuthorInfo(data) : null;
  const isOwner = Boolean(
    sidebarData?.nickname &&
      authorInfo?.nickname &&
      sidebarData.nickname === authorInfo.nickname
  );

  const handleDelete = (): void => {
    if (!window.confirm('일지를 삭제하시겠습니까?')) {
      return;
    }

    setIsDeleting(true);
    deleteDiary.mutate(safeDiaryId, {
      onSuccess: () => router.push('/diary'),
      onError: () => setIsDeleting(false),
    });
  };

  const handleLikeToggle = (): void => {
    if (!isLoggedIn) {
      setDismissed(false);
      return;
    }

    if (!data || isLikePending) {
      return;
    }

    if (data.likeInfo?.likedByMe) {
      unlikeDiary.mutate(data.id);
      return;
    }

    likeDiary.mutate(data.id);
  };

  const handleRequireLogin = (): void => {
    setDismissed(false);
  };

  const authDialog = (
    <LoginRequiredDialog
      open={showAuthDialog}
      onOpenChange={(open) => {
        if (!open) {
          setDismissed(true);
        }
      }}
      title="간편 가입 후에 둘러보세요!"
      description="일지 상세는 로그인 후 이용할 수 있습니다."
    />
  );

  if (!safeDiaryId) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-4">
        <Text size="body1" weight="medium" className="text-red-600">
          유효하지 않은 일지 ID입니다.
        </Text>
      </div>
    );
  }

  if (isLoading) {
    return (
      <>
        {authDialog}
        <DiaryDetailSkeleton />
      </>
    );
  }

  if (isError || !data) {
    return (
      <>
        {authDialog}
        <div className="flex min-h-[40vh] items-center justify-center p-4">
          <Text size="body1" weight="medium" className="text-red-600">
            {error
              ? normalizeApiError(error).message
              : '일지 상세를 불러오지 못했습니다.'}
          </Text>
        </div>
      </>
    );
  }

  return (
    <>
      {authDialog}
      <div className="data-fade-in">
        <DiaryDetailView
          diaryData={mapDiaryToViewData(data, challengeDetailData)}
          onLikeToggle={handleLikeToggle}
          isLikePending={isLikePending}
          isOwner={isOwner}
          onDelete={handleDelete}
          onRequireLogin={handleRequireLogin}
        />
      </div>
      {/* 모바일 sticky 댓글 입력바 — data-fade-in 래퍼 밖에 둔다:
          래퍼의 transform 이 containing block 을 만들어 position: fixed 가
          뷰포트 대신 래퍼 기준이 되는 문제를 피한다. */}
      <DiaryMobileCommentBar
        diaryId={data.id}
        isLoggedIn={isLoggedIn}
        onRequireLogin={handleRequireLogin}
      />
    </>
  );
}
