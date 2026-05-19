import type { SidebarChallenge } from '@feature/member/type/member';
import { formatDateISO, toStartOfDay } from '@module/utils/date';

import type {
  ChallengeCategory,
  ChallengeListItem,
  GoalType,
  ParticipationType,
} from '../../../challenge/board/type/challenge';
import type {
  ChallengeSummary as DiaryChallengeSummary,
  DiaryDetail,
  DiaryInfo,
} from '../../board/type/diary';
import {
  resolveDiaryImageList,
  resolveDiaryImageUrl,
} from '../../shared/utils/diaryImageUrl';

export function parsePositiveInteger(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const parsedValue = Number(value);
  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return null;
  }

  return parsedValue;
}

export function parseDateValue(value?: string | null): Date | null {
  if (!value) {
    return null;
  }

  const matchedDate = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (matchedDate) {
    const [, year, month, day] = matchedDate;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
}

export function isSelectableAchievedDate(
  date: Date,
  challengeStartDate?: string | null
): boolean {
  const today = toStartOfDay(new Date());
  const minDate = new Date(today);
  minDate.setDate(today.getDate() - 2);
  const targetDate = toStartOfDay(date);
  const parsedChallengeStartDate = parseDateValue(challengeStartDate);

  if (parsedChallengeStartDate) {
    const challengeStart = toStartOfDay(parsedChallengeStartDate);
    if (targetDate < challengeStart) {
      return false;
    }
  }

  return targetDate >= minDate && targetDate <= today;
}

export function getFirstSelectableAchievedDate(
  disabledDateKeys: Set<string>,
  challengeStartDate?: string | null
): Date | undefined {
  const today = toStartOfDay(new Date());

  for (let dayOffset = 0; dayOffset <= 2; dayOffset += 1) {
    const candidate = new Date(today);
    candidate.setDate(today.getDate() - dayOffset);

    if (
      isSelectableAchievedDate(candidate, challengeStartDate) &&
      !disabledDateKeys.has(formatDateISO(candidate))
    ) {
      return candidate;
    }
  }

  return undefined;
}

export function hasSelectableAchievedDate(
  disabledDateKeys: Set<string>,
  challengeStartDate?: string | null
): boolean {
  return Boolean(
    getFirstSelectableAchievedDate(disabledDateKeys, challengeStartDate)
  );
}

interface SubmitButtonLabelArgs {
  isCreating: boolean;
  isUpdating: boolean;
  isUploadingImage: boolean;
  isEditMode: boolean;
}

export function getSubmitButtonLabel({
  isCreating,
  isUpdating,
  isUploadingImage,
  isEditMode,
}: SubmitButtonLabelArgs): string {
  if (isCreating) {
    return '작성 중...';
  }
  if (isUpdating) {
    return '수정 중...';
  }
  if (isUploadingImage) {
    return '썸네일 업로드 중...';
  }
  return isEditMode ? '수정 완료' : '작성 완료';
}

function normalizeChallengeCategory(category: string): ChallengeCategory {
  const categoryMap: Record<string, ChallengeCategory> = {
    ALL: 'ALL',
    DEV: 'DEV',
    EXERCISE: 'EXERCISE',
    BOOK: 'BOOK',
    MUSIC: 'MUSIC',
    STUDY: 'STUDY',
    LEISURE: 'LEISURE',
    ECONOMY: 'ECONOMY',
  };

  return categoryMap[category] ?? 'DEV';
}

function normalizeGoalType(goalType: string): GoalType {
  return goalType === 'FIXED' ? 'FIXED' : 'FLEXIBLE';
}

function normalizeParticipationType(
  participationType: string
): ParticipationType {
  return participationType === 'GROUP' ? 'GROUP' : 'INDIVIDUAL';
}

export function mapDiaryChallengeToChallengeListItem(
  challenge: DiaryChallengeSummary
): ChallengeListItem {
  return {
    challengeId: challenge.challengeId,
    title: challenge.title,
    category: normalizeChallengeCategory(challenge.category),
    startDate: challenge.startDate,
    endDate: challenge.endDate,
    maxParticipantCnt: challenge.maxParticipantCnt,
    goalType: normalizeGoalType(challenge.goalType),
    participationType: normalizeParticipationType(challenge.participationType),
    participantCnt: challenge.participantCnt,
    liked: challenge.likeInfo.likedByMe,
    likeCnt: challenge.likeInfo.likeCnt,
  };
}

export function mapSidebarChallengeToChallengeListItem(
  challenge: SidebarChallenge
): ChallengeListItem {
  return {
    challengeId: challenge.challengeId,
    title: challenge.title,
    category: normalizeChallengeCategory(challenge.category),
    startDate: challenge.startDate,
    endDate: challenge.endDate,
    maxParticipantCnt: challenge.maxParticipantCnt,
    goalType: normalizeGoalType(challenge.goalType),
    participationType: normalizeParticipationType(challenge.participationType),
    participantCnt: challenge.participantCnt,
    liked: challenge.likeInfo.likedByMe,
    likeCnt: challenge.likeInfo.likeCnt,
  };
}

export type DiaryDetailWithAliases = DiaryDetail & {
  diaryInfo?: DiaryInfo | null;
  img?:
    | Array<{ url?: string | null; imageUrl?: string | null }>
    | string[]
    | string
    | null;
  imgUrl?: string[] | string | null;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  thumbnail?: string | null;
  images?:
    | Array<{ url?: string | null; imageUrl?: string | null } | string>
    | string[]
    | string
    | null;
};

export function revokeObjectUrlIfNeeded(url: string): void {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

export function getDiaryInfo(
  diary: DiaryDetail | null | undefined
): DiaryInfo | null {
  const diaryWithAliases = diary as DiaryDetailWithAliases | null | undefined;
  return diaryWithAliases?.diaryInfoDto ?? diaryWithAliases?.diaryInfo ?? null;
}

export function getDiaryThumbnailPreviewUrl(
  diary: DiaryDetail | null | undefined
): string {
  const diaryWithAliases = diary as DiaryDetailWithAliases | null | undefined;
  if (!diaryWithAliases) {
    return '';
  }

  const imageCandidates: unknown[] = [
    diaryWithAliases.imgUrl,
    diaryWithAliases.img,
    diaryWithAliases.imageUrl,
    diaryWithAliases.thumbnailUrl,
    diaryWithAliases.thumbnail,
    diaryWithAliases.images,
  ];

  for (const candidate of imageCandidates) {
    const resolvedImage = resolveDiaryImageList(candidate)?.[0];
    if (resolvedImage) {
      return resolvedImage;
    }
  }

  const imageFromLegacyFields = resolveDiaryImageUrl(diaryWithAliases.img);

  return imageFromLegacyFields ?? '';
}
