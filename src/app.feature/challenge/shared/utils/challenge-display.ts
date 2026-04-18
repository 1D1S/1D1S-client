import { type ChallengeType } from '../../board/type/challenge';

const CHALLENGE_TYPE_LABELS: Record<ChallengeType, string> = {
  FIXED: '고정 목표',
  FLEXIBLE: '자유 목표',
};

export function formatChallengeTypeLabel(
  challengeType?: string | null
): string {
  if (!challengeType) {
    return '-';
  }

  return (
    CHALLENGE_TYPE_LABELS[challengeType as ChallengeType] ?? challengeType
  );
}

export function isIndividualChallenge(maxParticipantCount: number): boolean {
  return maxParticipantCount <= 1;
}

export function formatChallengeCardTypeLabel(
  challengeType: string | null | undefined,
  maxParticipantCount: number
): string {
  if (isIndividualChallenge(maxParticipantCount)) {
    return '개인 목표';
  }

  return formatChallengeTypeLabel(challengeType);
}

