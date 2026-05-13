export {
  formatChallengeRemainingLabel,
  isChallengeEnded,
  isChallengeOngoing,
} from '@feature/challenge/board/utils/challengePeriod';
export {
  type DiaryEmotion,
  mapFeelingToEmotion,
} from '@feature/diary/shared/utils/feeling';

export function getDiaryAchievementRate(
  achievementRate?: number,
  fallbackAchievementRate?: number
): number {
  const rate = achievementRate ?? fallbackAchievementRate ?? 0;
  return Math.min(100, Math.max(0, rate));
}

