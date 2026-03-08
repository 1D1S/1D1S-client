import { type Feeling } from '@feature/diary/board/type/diary';

export type DiaryEmotion = 'happy' | 'soso' | 'sad';

const relativeTimeFormatter = new Intl.RelativeTimeFormat('ko', {
  numeric: 'auto',
});

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
  if (!createdAt) {
    return '방금 전';
  }

  const targetDate = new Date(createdAt);
  if (Number.isNaN(targetDate.getTime())) {
    return '방금 전';
  }

  const diffMinutes = Math.round((targetDate.getTime() - Date.now()) / 60000);
  const absMinutes = Math.abs(diffMinutes);

  if (absMinutes < 60) {
    return relativeTimeFormatter.format(diffMinutes, 'minute');
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return relativeTimeFormatter.format(diffHours, 'hour');
  }

  const diffDays = Math.round(diffHours / 24);
  return relativeTimeFormatter.format(diffDays, 'day');
}

export function getDiaryAchievementRate(
  achievementRate?: number,
  fallbackAchievementRate?: number
): number {
  const rate = achievementRate ?? fallbackAchievementRate ?? 0;
  return Math.min(100, Math.max(0, rate));
}
