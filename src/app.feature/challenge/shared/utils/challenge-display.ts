import { type GoalType } from '../../board/type/challenge';

const GOAL_TYPE_LABELS: Record<GoalType, string> = {
  FIXED: '고정 목표',
  FLEXIBLE: '자유 목표',
};

export function formatChallengeTypeLabel(
  goalType?: string | null
): string {
  if (!goalType) {
    return '-';
  }

  return GOAL_TYPE_LABELS[goalType as GoalType] ?? goalType;
}

export function isIndividualChallenge(maxParticipantCount: number): boolean {
  return maxParticipantCount <= 1;
}

export function formatChallengeCardTypeLabel(
  goalType: string | null | undefined,
  maxParticipantCount: number
): string {
  if (isIndividualChallenge(maxParticipantCount)) {
    return '개인 목표';
  }

  return formatChallengeTypeLabel(goalType);
}

