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

export function formatChallengeParticipantLabel(
  currentParticipantCount: number,
  maxParticipantCount: number
): string {
  if (isIndividualChallenge(maxParticipantCount)) {
    return '개인 목표';
  }

  return `${currentParticipantCount} / ${maxParticipantCount}`;
}

export function formatChallengePeriodLabel(
  startDate: string,
  endDate: string,
  isInfiniteChallenge = false
): string {
  return isInfiniteChallenge
    ? `${startDate} - 무한!`
    : `${startDate} - ${endDate}`;
}

export function getChallengeStatusDisplay({
  isInfiniteChallenge = false,
  isEarlyEnded = false,
  isOngoing,
  isEnded = false,
}: {
  isInfiniteChallenge?: boolean;
  isEarlyEnded?: boolean;
  isOngoing: boolean;
  isEnded?: boolean;
}): {
  label: string;
  className: string;
} {
  const isClosed = isInfiniteChallenge ? isEarlyEnded : isEnded;

  if (isClosed) {
    return {
      label: '종료됨',
      className: 'bg-gray-500',
    };
  }

  if (isOngoing) {
    return {
      label: '진행중',
      className: 'bg-green-500',
    };
  }

  return {
    label: '모집중',
    className: 'bg-blue-500',
  };
}
