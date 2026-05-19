import { getCategoryLabel } from '@constants/categories';
import {
  isChallengeEnded,
  isChallengeOngoing,
  isInfiniteChallengeEndDate,
} from '@feature/challenge/board/utils/challengePeriod';
import { formatChallengeTypeLabel } from '@feature/challenge/shared/utils/challengeDisplay';
import { getRelativeTimeLabel } from '@module/utils/date';

import type {
  ChallengeDetailResponse,
  ChallengeGoal,
  ChallengeSummary,
} from '../../../challenge/board/type/challenge';
import type {
  AuthorInfo,
  DiaryDetail,
  DiaryGoalStatus,
  Feeling,
} from '../../board/type/diary';
import {
  resolveDiaryImageList,
  resolveDiaryImageUrl,
} from '../../shared/utils/diaryImageUrl';
import type { DiaryComment } from '../type/comment';

export interface ChecklistItem {
  id: string;
  label: string;
}

export interface DiaryInfoWithAliases {
  createdAt?: string;
  challengedDate?: string;
  feeling?: Feeling;
  achievement?: number[] | null;
  diaryGoal?: DiaryGoalStatus[] | null;
  achievementRate?: number;
}

export type DiaryDetailWithAliases = DiaryDetail & {
  diaryInfoDto?: DiaryInfoWithAliases | null;
  diaryInfo?: DiaryInfoWithAliases | null;
  authorInfoDto?: AuthorInfo | null;
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

export const FEELING_LABEL_MAP: Record<Feeling, string> = {
  HAPPY: '아주 좋음',
  NORMAL: '보통',
  SAD: '아쉬움',
  NONE: '-',
};

export const FEELING_EMOJI_MAP: Record<Feeling, string> = {
  HAPPY: '😊',
  NORMAL: '😌',
  SAD: '🥲',
  NONE: '😐',
};

export interface DiaryDetailViewData {
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
  connectedChallengeSummary: ChallengeSummary | null;
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

export function feelingToMoodImage(
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

export function hasVisibleHtmlContent(contentHtml: string): boolean {
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

export function getDiaryInfo(
  diary: DiaryDetail
): DiaryInfoWithAliases | null {
  const diaryWithAliases = diary as DiaryDetailWithAliases;
  return diaryWithAliases.diaryInfoDto ?? diaryWithAliases.diaryInfo ?? null;
}

export function getAuthorInfo(diary: DiaryDetail): AuthorInfo | null {
  const diaryWithAliases = diary as DiaryDetailWithAliases;
  return diaryWithAliases.authorInfoDto ?? diaryWithAliases.author ?? null;
}

export function parsePositiveInteger(value: unknown): number | null {
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

export function resolveSidebarMemberId(sidebarData: unknown): number | null {
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

export function parseCommentTimestamp(value: string): number {
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

export function formatCommentDateTime(value: string): string {
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

export function sortCommentsByOldest(
  comments: DiaryComment[]
): DiaryComment[] {
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

export function mapDiaryToViewData(
  diary: DiaryDetail,
  challengeDetailData?: ChallengeDetailResponse
): DiaryDetailViewData {
  const diaryInfo = getDiaryInfo(diary);
  const authorInfo = getAuthorInfo(diary);
  const baseDate = diaryInfo?.createdAt ?? diaryInfo?.challengedDate ?? '';
  const relativeDateLabel = getRelativeTimeLabel(baseDate);
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
    connectedChallengeSummary: summary ?? null,
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

export {
  formatChallengeTypeLabel,
  getCategoryLabel,
  isChallengeEnded,
  isChallengeOngoing,
  isInfiniteChallengeEndDate,
};
