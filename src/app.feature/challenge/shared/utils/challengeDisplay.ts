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

