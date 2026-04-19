import { formatChallengeCardTypeLabel } from '@feature/challenge/shared/utils/challengeDisplay';
import { type Feeling } from '@feature/diary/board/type/diary';
import { getRelativeDiaryDateLabel } from '@feature/diary/shared/utils/diaryRelativeTime';

export {
  isChallengeEnded,
  isChallengeOngoing,
} from '@feature/challenge/board/utils/challengePeriod';

export type DiaryEmotion = 'happy' | 'soso' | 'sad';

export function formatChallengeType(
  challengeType: string,
  maxParticipantCount: number
): string {
  return formatChallengeCardTypeLabel(challengeType, maxParticipantCount);
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
