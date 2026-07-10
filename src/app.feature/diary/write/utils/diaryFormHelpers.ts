import type { SidebarChallenge } from '@feature/member/type/member';
import { formatDateISO, toStartOfDay } from '@module/utils/date';
import { extractDiaryImageList } from '@module/utils/diaryImageUrl';

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
    return '이미지 업로드 중...';
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
    thumbnailImage: challenge.thumbnailImage ?? undefined,
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
    thumbnailImage: challenge.thumbnailImage ?? undefined,
  };
}

// DiaryDetail 에 없는 레거시/방어용 이미지 별칭 필드만 얹는다.
// (imgUrl·thumbnailUrl·diaryInfo 는 이미 DiaryDetail 확정 타입에 있다.)
export type DiaryDetailWithAliases = DiaryDetail & {
  img?:
    | Array<{ url?: string | null; imageUrl?: string | null }>
    | string[]
    | string
    | null;
  imageUrl?: string | null;
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
  return diary?.diaryInfo ?? null;
}

// 폼에서 다루는 이미지 한 장.
// - existing: 조회 응답 imgUrl 원본값(버킷 URL). 저장 시 resolve 없이
//   그대로 재전송한다(변형하면 400 DIARY-008). 표시용 resolve 는 소비처가.
// - new: 아직 업로드 전 로컬 File. url 은 미리보기용 objectURL.
export interface DiaryImageItem {
  kind: 'existing' | 'new';
  url: string;
  file?: File;
}

// 수정 폼 진입 시 기존 이미지의 raw imgUrl 목록(순서 유지).
// 재전송용이므로 resolve 하지 않은 백엔드 원본 문자열을 돌려준다.
export function getDiaryImageUrls(
  diary: DiaryDetail | null | undefined
): string[] {
  const diaryWithAliases = diary as DiaryDetailWithAliases | null | undefined;
  if (!diaryWithAliases) {
    return [];
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
    const extracted = extractDiaryImageList(candidate);
    if (extracted && extracted.length > 0) {
      return extracted;
    }
  }

  return [];
}
