import type { ChallengeCtaState } from '../../board/type/challenge';

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
  // 참여 신청 후 호스트 승인 대기 상태 (myStatus === 'PENDING').
  // 뮤테이션의 isPending 과 혼동되지 않도록 명시적으로 명명한다.
  isJoinRequestPending: boolean;
  // 일지 작성 가능 여부(진행 중 또는 종료 후 유예 이내). 작성 CTA 노출 기준.
  canWriteDiary: boolean;
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
  /**
   * 참여 버튼 상태(서버 판정). 있으면 **이 값 하나가 참여 갈래를 정한다**.
   *
   * 모집창 조건(모집 없음 + 종료 임박 | 중도참여 불가)은 날짜와 설정이
   * 얽혀 있어 웹이 흉내 내면 서버와 갈린다. 없으면(구서버) 아래 기존
   * 분기가 그대로 산다.
   */
  ctaState?: ChallengeCtaState | null;
  /** 모집 시작 알림을 이미 신청해 뒀는가(서버 recruitAlertRequested). */
  isRecruitAlertOn?: boolean;
  /** `다음 모집 D-5 · 10.05 시작` — 버튼 위 힌트에 그대로 실린다. */
  recruitCountdown?: string;
  /** 모집 시작 알림 신청/해제 토글 */
  onToggleRecruitAlert?(): void;
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
    isJoinRequestPending,
    canWriteDiary,
    isCheckWriteDatesLoading,
    canJoinByStatus,
    isChallengeAlreadyEnded,
    isMidJoinBlocked,
    canJoin,
    isJoinPending,
    onEditChallenge,
    onDiaryCreate,
    onJoin,
    ctaState,
    isRecruitAlertOn = false,
    recruitCountdown = '',
    onToggleRecruitAlert,
  } = params;

  if (isHost) {
    const editChallenge = {
      label: '챌린지 수정',
      onClick: onEditChallenge,
      variant: 'secondary' as const,
    };
    // 호스트도 참여자이므로 작성 가능 기간에는 일지 작성을 우선 CTA 로 노출하고
    // 챌린지 수정은 보조 버튼으로 함께 제공한다.
    if (canWriteDiary) {
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
      label: canWriteDiary ? '일지 작성하기' : '진행 중이 아닙니다',
      onClick: onDiaryCreate,
      disabled: !canWriteDiary || isCheckWriteDatesLoading,
      variant: 'primary',
      show: true,
    };
  }
  if (isJoinRequestPending) {
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
  // ── 서버가 버튼 상태를 말해 주면 그것만 본다 ──────────────────────
  // 여기부터는 참여 갈래다(호스트·참여 중·승인 대기는 위에서 끝났다).
  if (canJoin && ctaState) {
    switch (ctaState) {
      case 'JOIN':
        return {
          label: '챌린지 참여하기',
          onClick: onJoin,
          disabled: isJoinPending,
          variant: 'primary',
          show: true,
        };
      case 'PRE_APPLY':
        return {
          label: '미리 지원하기',
          onClick: onJoin,
          disabled: isJoinPending,
          variant: 'primary',
          show: true,
          // 지금 시작하는 줄 알고 누르는 것을 막는다.
          hint: '다음 회차가 열리면 바로 시작해요',
        };
      case 'RECRUIT_WAIT':
        // 지금은 못 들어가지만 다음 모집이 예정돼 있으면 빈손으로 돌려보내지
        // 않는다 — 모집이 열리는 날 알려 주겠다고 묻는다.
        return {
          label: isRecruitAlertOn ? '모집 알림 신청됨' : '모집 시작 알림 받기',
          onClick: onToggleRecruitAlert ?? (() => undefined),
          disabled: isJoinPending,
          variant: isRecruitAlertOn ? 'secondary' : 'primary',
          show: true,
          // 왜 지금 못 들어가는지 + 언제 열리는지. 이유 없이 막힌 버튼만
          // 보여 주면 고장으로 읽힌다.
          hint: recruitCountdown || '지금은 모집 기간이 아니에요',
        };
      default:
        // NONE — 눌러도 갈 곳이 없다. 버튼째 숨긴다.
        return {
          label: '참여 불가',
          onClick: () => undefined,
          disabled: true,
          variant: 'secondary',
          show: false,
        };
    }
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
