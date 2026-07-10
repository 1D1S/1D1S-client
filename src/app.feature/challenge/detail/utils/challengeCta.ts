export type ChallengeCtaVariant = 'primary' | 'secondary';

// CTA 결정 결과: 호스트 / 참여 중 / 대기 / 신청 가능 / 신청 불가
export interface ChallengeCtaConfig {
  label: string;
  onClick(): void;
  disabled: boolean;
  variant: ChallengeCtaVariant;
  show: boolean;
  hint?: string;
  secondary?: {
    label: string;
    onClick(): void;
    variant: ChallengeCtaVariant;
  };
}

export interface BuildChallengeCtaParams {
  isHost: boolean;
  isParticipating: boolean;
  isPending: boolean;
  isChallengeCurrentlyOngoing: boolean;
  isCheckWriteDatesLoading: boolean;
  canJoinByStatus: boolean;
  isChallengeAlreadyEnded: boolean;
  isMidJoinBlocked: boolean;
  canJoin: boolean;
  isJoinPending: boolean;
  /** 호스트 챌린지 수정 이동 */
  onEditChallenge(): void;
  /** 일지 작성 플로우 진입 */
  onDiaryCreate(): void;
  /** 참여 신청 플로우 진입 */
  onJoin(): void;
}

// 클릭 불가 안내 버튼(대기/종료/중도참여불가)의 공통 형태.
function disabledCta(label: string, hint?: string): ChallengeCtaConfig {
  return {
    label,
    onClick: () => undefined,
    disabled: true,
    variant: 'secondary',
    show: true,
    hint,
  };
}

/**
 * 챌린지 상세 CTA 버튼 구성 결정. ChallengeDetailScreen 의 인라인 IIFE 를
 * 순수 함수로 추출 — 상태 플래그와 핸들러만 입력받아 표시 스펙을 반환한다.
 */
export function buildChallengeCta(
  params: BuildChallengeCtaParams
): ChallengeCtaConfig {
  const {
    isHost,
    isParticipating,
    isPending,
    isChallengeCurrentlyOngoing,
    isCheckWriteDatesLoading,
    canJoinByStatus,
    isChallengeAlreadyEnded,
    isMidJoinBlocked,
    canJoin,
    isJoinPending,
    onEditChallenge,
    onDiaryCreate,
    onJoin,
  } = params;

  if (isHost) {
    const editChallenge = {
      label: '챌린지 수정',
      onClick: onEditChallenge,
      variant: 'secondary' as const,
    };
    // 호스트도 참여자이므로 진행 중에는 일지 작성을 우선 CTA 로 노출하고
    // 챌린지 수정은 보조 버튼으로 함께 제공한다.
    if (isChallengeCurrentlyOngoing) {
      return {
        label: '일지 작성하기',
        onClick: onDiaryCreate,
        disabled: isCheckWriteDatesLoading,
        variant: 'primary',
        show: true,
        secondary: editChallenge,
      };
    }
    return {
      ...editChallenge,
      disabled: false,
      show: true,
    };
  }
  if (isParticipating) {
    return {
      label: isChallengeCurrentlyOngoing
        ? '일지 작성하기'
        : '진행 중이 아닙니다',
      onClick: onDiaryCreate,
      disabled: !isChallengeCurrentlyOngoing || isCheckWriteDatesLoading,
      variant: 'primary',
      show: true,
    };
  }
  if (isPending) {
    return disabledCta('참여 승인 대기중');
  }
  if (canJoinByStatus && isChallengeAlreadyEnded) {
    return disabledCta('종료된 챌린지');
  }
  if (canJoinByStatus && isMidJoinBlocked) {
    return disabledCta(
      '중도 참여 불가',
      '이미 시작된 챌린지는 중도 참여가 불가능합니다'
    );
  }
  if (canJoin) {
    return {
      label: '챌린지 참여하기',
      onClick: onJoin,
      disabled: isJoinPending,
      variant: 'primary',
      show: true,
    };
  }
  return {
    label: '참여 불가',
    onClick: () => undefined,
    disabled: true,
    variant: 'secondary',
    show: false,
  };
}
