import { type Feeling } from '@feature/diary/board/type/diary';
import { getRelativeDiaryDateLabel } from '@feature/diary/shared/utils/diary-relative-time';

export type DiaryEmotion = 'happy' | 'soso' | 'sad';

export function formatChallengeType(challengeType: string): string {
  return { FIXED: '고정 목표', FLEXIBLE: '개인 목표' }[challengeType] ?? '기타';
}

export function isChallengeOngoing(
  startDate: string,
  endDate: string
): boolean {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return false;
  }

  return now >= start && now <= end;
}

export function isChallengeEnded(endDate: string): boolean {
  const end = new Date(endDate);

  if (Number.isNaN(end.getTime())) {
    return false;
  }

  return new Date() > end;
}

export function mapFeelingToEmotion(feeling: Feeling): DiaryEmotion {
  switch (feeling) {
    case 'HAPPY':
      return 'happy';
    case 'SAD':
      return 'sad';
    case 'NORMAL':
    case 'NONE':
    default:
      return 'soso';
  }
}

export function toRelativeDateLabel(createdAt: string): string {
  return getRelativeDiaryDateLabel(createdAt);
}

export function getDiaryAchievementRate(
  achievementRate?: number,
  fallbackAchievementRate?: number
): number {
  const rate = achievementRate ?? fallbackAchievementRate ?? 0;
  return Math.min(100, Math.max(0, rate));
}
