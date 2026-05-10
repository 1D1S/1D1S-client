'use client';

import {
  Button,
  CheckList,
  CircleAvatar,
  type CommentNode,
  CommentThread,
  Text,
  TextField,
} from '@1d1s/design-system';
import { LoginRequiredDialog } from '@component/LoginRequiredDialog';
import { getCategoryLabel } from '@constants/categories';
import { normalizeApiError } from '@module/api/error';
import { cn } from '@module/utils/cn';
import {
  ChevronRight,
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
import {
  ChallengeDetailResponse,
  ChallengeGoal,
} from '../../../challenge/board/type/challenge';
import { useIsLoggedIn } from '../../../member/hooks/useIsLoggedIn';
import { useSidebar } from '../../../member/hooks/useMemberQueries';
import { useDiaryDetail } from '../../board/hooks/useDiaryQueries';
import {
  AuthorInfo,
  DiaryDetail,
  DiaryGoalStatus,
  Feeling,
} from '../../board/type/diary';
import { DiaryContentRenderer } from '../../shared/components/DiaryContentRenderer';
import {
  resolveDiaryImageList,
  resolveDiaryImageUrl,
} from '../../shared/utils/diaryImageUrl';
import { getRelativeDiaryDateLabel } from '../../shared/utils/diaryRelativeTime';
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

interface ChecklistItem {
  id: string;
  label: string;
}

interface DiaryInfoWithAliases {
  createdAt?: string;
  challengedDate?: string;
  feeling?: Feeling;
  achievement?: number[] | null;
  diaryGoal?: DiaryGoalStatus[] | null;
  achievementRate?: number;
}

type DiaryDetailWithAliases = DiaryDetail & {
  diaryInfoDto?: DiaryInfoWithAliases | null;
  diaryInfo?: DiaryInfoWithAliases | null;
  author?: AuthorInfo | null;
};

interface DiaryImageFields {
  imgUrl?: unknown;
  img?: unknown;
  imageUrl?: unknown;
  thumbnailUrl?: unknown;
  images?: unknown;
  thumbnail?: unknown;
}

const FEELING_LABEL_MAP: Record<Feeling, string> = {
  HAPPY: '아주 좋음',
  NORMAL: '보통',
  SAD: '아쉬움',
  NONE: '-',
};

const FEELING_EMOJI_MAP: Record<Feeling, string> = {
  HAPPY: '😊',
  NORMAL: '😌',
  SAD: '🥲',
  NONE: '😐',
};

interface DiaryDetailViewData {
  id: number;
  title: string;
  createdAt: string;
  relativeDateLabel: string;
  feeling: Feeling;
  feelingLabel: string;
  feelingEmoji: string;
  feelingMoodImage: { src: string; alt: string } | null;
  achievementPercent: number;
  connectedChallengeId: number | null;
  connectedChallengeTitle: string;
  connectedChallengeCategory: string;
  likedByMe: boolean;
  likeCount: number;
  checklistItems: ChecklistItem[];
  checkedChecklistIds: string[];
  contentHtml: string;
  hasContentHtml: boolean;
  contentImageUrl: string | null;
  authorName: string | null;
  authorId: number | null;
  authorProfileImage: string | null;
}

function feelingToMoodImage(
  feeling: Feeling
): { src: string; alt: string } | null {
  switch (feeling) {
    case 'HAPPY':
      return { src: '/images/mood-happy.PNG', alt: '행복한 얼굴' };
    case 'SAD':
      return { src: '/images/mood-sad.PNG', alt: '슬픈 얼굴' };
    case 'NORMAL':
      return { src: '/images/mood-soso.PNG', alt: '무표정 얼굴' };
    case 'NONE':
    default:
      return null;
  }
}

function hasVisibleHtmlContent(contentHtml: string): boolean {
  if (!contentHtml) {
    return false;
  }

  if (/<img[\s>]/i.test(contentHtml)) {
    return true;
  }

  const textWithoutTags = contentHtml
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .trim();

  return textWithoutTags.length > 0;
}

function resolveFirstImage(...rawSources: unknown[]): string | null {
  for (const rawSource of rawSources) {
    const resolvedImage = resolveDiaryImageList(rawSource)?.[0];
    if (resolvedImage) {
      return resolvedImage;
    }

    const resolvedSingleImage = resolveDiaryImageUrl(rawSource);
    if (resolvedSingleImage) {
      return resolvedSingleImage;
    }
  }

  return null;
}

function getDiaryInfo(diary: DiaryDetail): DiaryInfoWithAliases | null {
  const diaryWithAliases = diary as DiaryDetailWithAliases;
  return diaryWithAliases.diaryInfoDto ?? diaryWithAliases.diaryInfo ?? null;
}

function getAuthorInfo(diary: DiaryDetail): AuthorInfo | null {
  const diaryWithAliases = diary as DiaryDetailWithAliases;
  return diaryWithAliases.authorInfoDto ?? diaryWithAliases.author ?? null;
}

function parsePositiveInteger(value: unknown): number | null {
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
    return value;
  }

  if (typeof value === 'string') {
    const parsedValue = Number(value);
    if (Number.isInteger(parsedValue) && parsedValue > 0) {
      return parsedValue;
    }
  }

  return null;
}

function resolveSidebarMemberId(sidebarData: unknown): number | null {
  if (!sidebarData || typeof sidebarData !== 'object') {
    return null;
  }

  const sidebar = sidebarData as Record<string, unknown>;
  const candidateKeys = ['memberId', 'member_id', 'userId', 'user_id', 'id'];

  for (const key of candidateKeys) {
    const parsedValue = parsePositiveInteger(sidebar[key]);
    if (parsedValue !== null) {
      return parsedValue;
    }
  }

  return null;
}

function parseCommentTimestamp(value: string): number {
  if (!value) {
    return 0;
  }

  const normalizedValue = value.replace(
    /\.(\d{3})\d*(?=(?:Z|[+-]\d{2}:\d{2})?$)/,
    '.$1'
  );
  const parsedTime = new Date(normalizedValue).getTime();
  if (!Number.isNaN(parsedTime)) {
    return parsedTime;
  }

  const directParsedTime = new Date(value).getTime();
  return Number.isNaN(directParsedTime) ? 0 : directParsedTime;
}

function formatCommentDateTime(value: string): string {
  const timestamp = parseCommentTimestamp(value);
  if (!timestamp) {
    return '-';
  }

  const date = new Date(timestamp);
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}.${month}.${day} ${hours}:${minutes}`;
}

function sortCommentsByOldest(comments: DiaryComment[]): DiaryComment[] {
  return [...comments].sort((leftComment, rightComment) => {
    const timeDiff =
      parseCommentTimestamp(leftComment.createdAt) -
      parseCommentTimestamp(rightComment.createdAt);
    if (timeDiff !== 0) {
      return timeDiff;
    }
    return leftComment.id - rightComment.id;
  });
}

function mapDiaryToViewData(
  diary: DiaryDetail,
  challengeDetailData?: ChallengeDetailResponse
): DiaryDetailViewData {
  const diaryInfo = getDiaryInfo(diary);
  const authorInfo = getAuthorInfo(diary);
  const baseDate = diaryInfo?.createdAt ?? diaryInfo?.challengedDate ?? '';
  const relativeDateLabel = getRelativeDiaryDateLabel(baseDate);
  const challengeGoals: ChallengeGoal[] =
    challengeDetailData?.challengeGoals ?? [];
  const diaryGoals = diaryInfo?.diaryGoal ?? [];
  const achievementIds = new Set(
    (diaryInfo?.achievement ?? []).map((goalId) => String(goalId))
  );
  const checklistItemsFromChallenge = challengeGoals.map((goal) => ({
    id: String(goal.challengeGoalId),
    label: goal.content,
  }));

  let checklistItems: ChecklistItem[] = [];
  let checkedChecklistIds: string[] = [];

  if (checklistItemsFromChallenge.length > 0) {
    checklistItems = checklistItemsFromChallenge;

    if (diaryGoals.length > 0) {
      const achievedDiaryGoalIds = new Set(
        diaryGoals
          .filter((goal) => goal.isAchieved)
          .map((goal) => String(goal.challengeGoalId))
      );
      const achievedDiaryGoalNames = new Set(
        diaryGoals
          .filter((goal) => goal.isAchieved && Boolean(goal.challengeGoalName))
          .map((goal) => goal.challengeGoalName.trim())
      );

      checkedChecklistIds = checklistItems
        .filter(
          (item) =>
            achievedDiaryGoalIds.has(item.id) ||
            achievedDiaryGoalNames.has(item.label.trim())
        )
        .map((item) => item.id);
    } else {
      checkedChecklistIds = checklistItems
        .filter((item) => achievementIds.has(item.id))
        .map((item) => item.id);
    }
  } else if (diaryGoals.length > 0) {
    checklistItems = diaryGoals.map((goal) => ({
      id: String(goal.challengeGoalId),
      label: goal.challengeGoalName || `목표 ${goal.challengeGoalId}`,
    }));
    checkedChecklistIds = diaryGoals
      .filter((goal) => goal.isAchieved)
      .map((goal) => String(goal.challengeGoalId));
  } else {
    const achievedGoalIds = Array.from(achievementIds);
    checklistItems = achievedGoalIds.map((goalId) => ({
      id: goalId,
      label: `목표 ${goalId}`,
    }));
    checkedChecklistIds = achievedGoalIds;
  }

  const summary = challengeDetailData?.challengeSummary;
  const diaryWithImageAliases = diary as DiaryDetail & DiaryImageFields;
  const contentImageUrl =
    resolveFirstImage(
      diaryWithImageAliases.imgUrl,
      diaryWithImageAliases.img,
      diaryWithImageAliases.imageUrl,
      diaryWithImageAliases.thumbnailUrl,
      diaryWithImageAliases.images,
      diaryWithImageAliases.thumbnail
    ) ?? null;

  const feeling: Feeling = diaryInfo?.feeling ?? 'NONE';
  const rawAchievementRate =
    diary.achievementRate ?? diaryInfo?.achievementRate ?? 0;
  const achievementPercent = Math.min(
    100,
    Math.max(0, Math.round(rawAchievementRate))
  );

  return {
    id: diary.id,
    title: diary.title || '제목 없는 일지',
    createdAt: baseDate,
    relativeDateLabel,
    feeling,
    feelingLabel: FEELING_LABEL_MAP[feeling],
    feelingEmoji: FEELING_EMOJI_MAP[feeling],
    feelingMoodImage: feelingToMoodImage(feeling),
    achievementPercent,
    connectedChallengeId:
      summary?.challengeId ?? diary.challenge?.challengeId ?? null,
    connectedChallengeTitle:
      summary?.title ?? diary.challenge?.title ?? '연동된 챌린지가 없습니다.',
    connectedChallengeCategory:
      getCategoryLabel(summary?.category ?? diary.challenge?.category) || '-',
    likedByMe: diary.likeInfo?.likedByMe ?? false,
    likeCount: diary.likeInfo?.likeCnt ?? 0,
    checklistItems,
    checkedChecklistIds,
    contentHtml: diary.content ?? '',
    hasContentHtml: hasVisibleHtmlContent(diary.content ?? ''),
    contentImageUrl,
    authorName: authorInfo?.nickname ?? null,
    authorId: authorInfo?.id ?? null,
    authorProfileImage: authorInfo?.profileImage ?? null,
  };
}

function DiaryChallengeTag({
  title,
  onClick,
}: {
  title: string;
  onClick?(): void;
}): React.ReactElement {
  const baseClass = cn(
    'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5',
    'border-main-200 bg-main-100 text-main-800 border text-xs font-bold'
  );
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          baseClass,
          'hover:bg-main-200/50 cursor-pointer transition-colors'
        )}
      >
        <Flag className="h-3 w-3" />
        <span className="truncate">{title}</span>
      </button>
    );
  }
  return (
    <span className={baseClass}>
      <Flag className="h-3 w-3" />
      <span className="truncate">{title}</span>
    </span>
  );
}

function DiaryAuthorRow({
  authorName,
  authorId,
  authorProfileImage,
  relativeDateLabel,
}: {
  authorName: string | null;
  authorId: number | null;
  authorProfileImage: string | null;
  relativeDateLabel: string;
}): React.ReactElement {
  const router = useRouter();
  const handleClick = (): void => {
    if (authorId) {
      router.push(`/member/${authorId}`);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!authorId}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl py-1 text-left',
        authorId && 'cursor-pointer transition-colors hover:bg-gray-50'
      )}
    >
      <CircleAvatar imageUrl={authorProfileImage ?? undefined} size="md" />
      <div className="flex min-w-0 flex-1 flex-col">
        <Text size="body2" weight="bold" className="truncate text-gray-900">
          {authorName ?? '익명'}
        </Text>
        <Text size="caption2" weight="regular" className="text-gray-500">
          {relativeDateLabel}
        </Text>
      </div>
    </button>
  );
}

function DiaryGoalsCard({
  checklistItems,
  checkedChecklistIds,
}: {
  checklistItems: ChecklistItem[];
  checkedChecklistIds: string[];
}): React.ReactElement {
  const checklistOptions = useMemo(
    () =>
      checklistItems.map((item) => ({
        id: item.id,
        label: item.label,
      })),
    [checklistItems]
  );
  const handleNoop = (): void => {};

  return (
    <div
      className={cn(
        'rounded-2xl border border-gray-200 bg-gray-50 p-4'
      )}
    >
      <div className="mb-3 flex items-baseline justify-between">
        <Text size="body2" weight="bold" className="text-gray-900">
          오늘의 목표
        </Text>
        <Text size="caption2" weight="medium" className="text-gray-500">
          {checkedChecklistIds.length}/{checklistItems.length} 달성
        </Text>
      </div>
      {checklistItems.length > 0 ? (
        <CheckList
          options={checklistOptions}
          value={checkedChecklistIds}
          onValueChange={handleNoop}
          disabled
        />
      ) : (
        <Text size="caption1" weight="regular" className="text-gray-500">
          달성 목표 데이터가 없습니다.
        </Text>
      )}
    </div>
  );
}

function DiaryHeroImage({
  imageUrl,
  title,
  onOpen,
}: {
  imageUrl: string;
  title: string;
  onOpen(): void;
}): React.ReactElement {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'relative aspect-[16/10] w-full cursor-zoom-in',
        'overflow-hidden rounded-2xl border border-gray-200 bg-gray-100'
      )}
    >
      <Image
        src={imageUrl}
        alt={title}
        fill
        sizes="(max-width: 1024px) 100vw, 720px"
        className="object-cover"
      />
    </button>
  );
}

function DiaryImageLightbox({
  imageUrl,
  onClose,
}: {
  imageUrl: string;
  onClose(): void;
}): React.ReactElement {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center',
        'bg-black/80 p-4'
      )}
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative max-h-full max-w-full"
        onClick={(event) => event.stopPropagation()}
        role="presentation"
      >
        <button
          type="button"
          className="absolute -top-10 right-0 text-white/80 hover:text-white"
          onClick={onClose}
        >
          ✕
        </button>
        <Image
          src={imageUrl}
          alt="일지 이미지 원본"
          width={0}
          height={0}
          sizes="90vw"
          className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain"
          style={{ width: 'auto', height: 'auto' }}
        />
      </div>
    </div>
  );
}

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
    <div className="mt-6 flex flex-wrap gap-2 border-t border-gray-200 pt-5">
      <Button
        variant={diaryData.likedByMe ? 'default' : 'outlined'}
        size="medium"
        onClick={onLikeToggle}
        disabled={isLikePending}
      >
        <Heart
          className={cn(
            'mr-1 h-4 w-4',
            diaryData.likedByMe && 'fill-current'
          )}
        />
        좋아요 {diaryData.likeCount}
      </Button>
      <Button variant="outlined" size="medium" onClick={onShare}>
        <Share2 className="mr-1 h-4 w-4" />
        공유
      </Button>
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
  const [commentContent, setCommentContent] = useState('');
  const {
    data: commentsData,
    isLoading: isCommentsLoading,
    isError: isCommentsError,
  } = useDiaryComments(diaryId, { page: 0, size: 10 });
  const commentItems = useMemo(
    () => sortCommentsByOldest(commentsData?.items ?? []),
    [commentsData?.items]
  );
  const commentIds = useMemo(
    () => commentItems.map((comment) => comment.id),
    [commentItems]
  );
  const { data: commentRepliesMap = {} } = useCommentRepliesMap(commentIds, {
    page: 0,
    size: 10,
    enabled: commentIds.length > 0,
  });
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
        'rounded-2xl border border-gray-200 bg-white',
        'lg:sticky lg:top-5'
      )}
    >
      <div className="p-4 lg:p-5">
        <Text size="body1" weight="bold" className="mb-3 block text-gray-900">
          응원 댓글 {totalCommentCount}개
        </Text>

        {isCommentsLoading ? (
          <Text size="caption1" weight="regular" className="text-gray-500">
            댓글을 불러오는 중입니다.
          </Text>
        ) : isCommentsError ? (
          <Text size="caption1" weight="regular" className="text-red-600">
            댓글을 불러오지 못했습니다.
          </Text>
        ) : threadComments.length === 0 ? (
          <Text size="caption1" weight="regular" className="text-gray-500">
            첫 댓글을 남겨보세요.
          </Text>
        ) : (
          <CommentThread
            comments={threadComments}
            currentUserId={
              currentMemberId !== null ? String(currentMemberId) : undefined
            }
            onReplySubmit={handleReplySubmit}
            onDelete={handleDeleteComment}
          />
        )}

        <div className="mt-3 flex items-center gap-1.5">
          <TextField
            id="diary-comment-content"
            size="sm"
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
  const { data: commentsData } = useDiaryComments(diaryData.id, {
    page: 0,
    size: 10,
  });
  const { data: commentRepliesMap = {} } = useCommentRepliesMap(
    commentsData?.items?.map((comment) => comment.id) ?? [],
    {
      page: 0,
      size: 10,
      enabled: (commentsData?.items?.length ?? 0) > 0,
    }
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
    <div className="min-h-screen w-full">
      <div
        className={cn(
          'mx-auto w-full max-w-[1200px]',
          'px-5 py-7 lg:px-8 lg:py-10'
        )}
      >
        <div className="mb-4 flex items-center gap-1.5 text-gray-500">
          <Text size="caption2" weight="regular" className="text-gray-500">
            일지
          </Text>
          <ChevronRight className="h-3 w-3" />
          <Text
            size="caption2"
            weight="bold"
            className="truncate text-gray-900"
          >
            {diaryData.title}
          </Text>
        </div>

        <div
          className={cn(
            'grid gap-7',
            'lg:grid-cols-[minmax(0,1fr)_320px]'
          )}
        >
          <article>
            <div className="flex items-start gap-3">
              <DiaryAuthorRow
                authorName={diaryData.authorName}
                authorId={diaryData.authorId}
                authorProfileImage={diaryData.authorProfileImage}
                relativeDateLabel={diaryData.relativeDateLabel}
              />
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
            </div>

            <div className="mt-4">
              <DiaryChallengeTag
                title={diaryData.connectedChallengeTitle}
                onClick={
                  diaryData.connectedChallengeId
                    ? () =>
                        router.push(
                          `/challenge/${diaryData.connectedChallengeId}`
                        )
                    : undefined
                }
              />
            </div>

            <Text
              as="h1"
              size="display1"
              weight="bold"
              className="mt-4 block text-gray-900"
            >
              {diaryData.title}
            </Text>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              {diaryData.feelingMoodImage ? (
                <Image
                  src={diaryData.feelingMoodImage.src}
                  alt={diaryData.feelingMoodImage.alt}
                  width={28}
                  height={28}
                  className="h-7 w-7"
                />
              ) : (
                <span className="text-2xl" aria-hidden>
                  {diaryData.feelingEmoji}
                </span>
              )}
              <Text size="caption1" weight="regular" className="text-gray-500">
                오늘의 기분 · {diaryData.feelingLabel}
              </Text>
              <div className="ml-auto">
                <span
                  className={cn(
                    'inline-flex items-center rounded-full',
                    'px-2.5 py-1 text-xs font-bold text-white',
                    isHundredPercent ? 'bg-green-500' : 'bg-main-800'
                  )}
                >
                  {diaryData.achievementPercent}% 달성
                </span>
              </div>
            </div>

            <div className="mt-5">
              <DiaryGoalsCard
                checklistItems={diaryData.checklistItems}
                checkedChecklistIds={diaryData.checkedChecklistIds}
              />
            </div>

            {diaryData.contentImageUrl ? (
              <div className="mt-5">
                <DiaryHeroImage
                  imageUrl={diaryData.contentImageUrl}
                  title={diaryData.title}
                  onOpen={() => setIsImageOpen(true)}
                />
              </div>
            ) : null}

            <div className="mt-6">
              {diaryData.hasContentHtml ? (
                <DiaryContentRenderer
                  html={diaryData.contentHtml}
                  className="text-[15px] leading-[1.9]"
                />
              ) : (
                <Text size="body2" weight="regular" className="text-gray-500">
                  작성된 내용이 없습니다.
                </Text>
              )}
            </div>

            <DiaryActionToolbar
              diaryData={diaryData}
              totalCommentCount={totalCommentCount}
              isLikePending={isLikePending}
              onLikeToggle={onLikeToggle}
              onShare={() => void handleShare()}
            />
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
        <div className="flex min-h-[40vh] items-center justify-center p-4">
          <Text size="body1" weight="medium" className="text-gray-500">
            일지 상세를 불러오는 중입니다.
          </Text>
        </div>
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
      <DiaryDetailView
        diaryData={mapDiaryToViewData(data, challengeDetailData)}
        onLikeToggle={handleLikeToggle}
        isLikePending={isLikePending}
        isOwner={isOwner}
        onDelete={handleDelete}
        onRequireLogin={handleRequireLogin}
      />
    </>
  );
}
