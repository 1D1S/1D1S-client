import { describe, expect, it, vi } from 'vitest';

import { buildChallengeCta, BuildChallengeCtaParams } from './challengeCta';

function makeParams(
  overrides: Partial<BuildChallengeCtaParams> = {}
): BuildChallengeCtaParams {
  return {
    isHost: false,
    isParticipating: false,
    isJoinRequestPending: false,
    canWriteDiary: false,
    isCheckWriteDatesLoading: false,
    canJoinByStatus: false,
    isChallengeAlreadyEnded: false,
    isMidJoinBlocked: false,
    canJoin: false,
    isJoinPending: false,
    onEditChallenge: vi.fn(),
    onDiaryCreate: vi.fn(),
    onJoin: vi.fn(),
    ...overrides,
  };
}

describe('buildChallengeCta', () => {
  it('호스트 + 진행 중: 일지 작성 primary + 수정 secondary', () => {
    const cta = buildChallengeCta(
      makeParams({ isHost: true, canWriteDiary: true })
    );
    expect(cta.label).toBe('일지 작성하기');
    expect(cta.variant).toBe('primary');
    expect(cta.secondary?.label).toBe('챌린지 수정');
  });

  it('호스트 + 종료: 챌린지 수정 단독 노출', () => {
    const cta = buildChallengeCta(
      makeParams({ isHost: true, canWriteDiary: false })
    );
    expect(cta.label).toBe('챌린지 수정');
    expect(cta.disabled).toBe(false);
    expect(cta.secondary).toBeUndefined();
  });

  it('참여 중 + 진행 아님: 비활성 "진행 중이 아닙니다"', () => {
    const cta = buildChallengeCta(
      makeParams({ isParticipating: true, canWriteDiary: false })
    );
    expect(cta.label).toBe('진행 중이 아닙니다');
    expect(cta.disabled).toBe(true);
  });

  it('참여 중 + 진행 중 + 날짜 로딩: 일지 작성 비활성', () => {
    const cta = buildChallengeCta(
      makeParams({
        isParticipating: true,
        canWriteDiary: true,
        isCheckWriteDatesLoading: true,
      })
    );
    expect(cta.label).toBe('일지 작성하기');
    expect(cta.disabled).toBe(true);
  });

  it('승인 대기: 비활성 안내', () => {
    const cta = buildChallengeCta(makeParams({ isJoinRequestPending: true }));
    expect(cta.label).toBe('참여 승인 대기중');
    expect(cta.disabled).toBe(true);
    expect(cta.show).toBe(true);
  });

  it('신청 가능 + 종료된 챌린지: "종료된 챌린지"', () => {
    const cta = buildChallengeCta(
      makeParams({ canJoinByStatus: true, isChallengeAlreadyEnded: true })
    );
    expect(cta.label).toBe('종료된 챌린지');
  });

  it('신청 가능 + 중도 참여 차단: hint 포함', () => {
    const cta = buildChallengeCta(
      makeParams({ canJoinByStatus: true, isMidJoinBlocked: true })
    );
    expect(cta.label).toBe('중도 참여 불가');
    expect(cta.hint).toContain('중도 참여');
  });

  it('참여 가능: 참여하기 CTA + join pending 반영', () => {
    const cta = buildChallengeCta(
      makeParams({ canJoin: true, isJoinPending: true })
    );
    expect(cta.label).toBe('챌린지 참여하기');
    expect(cta.disabled).toBe(true);
    cta.onClick();
  });

  it('그 외: 참여 불가 + show=false', () => {
    const cta = buildChallengeCta(makeParams());
    expect(cta.label).toBe('참여 불가');
    expect(cta.show).toBe(false);
  });
});

describe('ctaState 분기 (서버 판정)', () => {
  const joinable = {
    isHost: false,
    isParticipating: false,
    isJoinRequestPending: false,
    canWriteDiary: false,
    isCheckWriteDatesLoading: false,
    canJoinByStatus: false,
    isChallengeAlreadyEnded: false,
    isMidJoinBlocked: false,
    canJoin: true,
    isJoinPending: false,
    onEditChallenge: () => undefined,
    onDiaryCreate: () => undefined,
    onJoin: () => undefined,
  };

  it('JOIN 은 참여 버튼', () => {
    const cta = buildChallengeCta({ ...joinable, ctaState: 'JOIN' });
    expect(cta).toMatchObject({ label: '챌린지 참여하기', show: true });
  });

  it('PRE_APPLY 는 미리 지원 + 다음 회차 안내', () => {
    const cta = buildChallengeCta({ ...joinable, ctaState: 'PRE_APPLY' });
    expect(cta.label).toBe('미리 지원하기');
    expect(cta.disabled).toBe(false);
    expect(cta.hint).toBe('다음 회차가 열리면 바로 시작해요');
  });

  it('RECRUIT_WAIT 는 참여 대신 알림 토글을 부른다', () => {
    let toggled = false;
    const cta = buildChallengeCta({
      ...joinable,
      ctaState: 'RECRUIT_WAIT',
      recruitCountdown: '다음 모집 D-5 · 10.05 시작',
      onToggleRecruitAlert: () => {
        toggled = true;
      },
      onJoin: () => {
        throw new Error('모집 대기 중에는 참여로 가면 안 된다');
      },
    });
    expect(cta.label).toBe('모집 시작 알림 받기');
    expect(cta.hint).toBe('다음 모집 D-5 · 10.05 시작');
    cta.onClick();
    expect(toggled).toBe(true);
  });

  it('RECRUIT_WAIT 신청 후에는 신청됨으로 바뀐다', () => {
    expect(
      buildChallengeCta({
        ...joinable,
        ctaState: 'RECRUIT_WAIT',
        isRecruitAlertOn: true,
      }).label
    ).toBe('모집 알림 신청됨');
  });

  it('모집일을 모르면 이유만 알려 준다', () => {
    expect(
      buildChallengeCta({ ...joinable, ctaState: 'RECRUIT_WAIT' }).hint
    ).toBe('지금은 모집 기간이 아니에요');
  });

  it('NONE 은 버튼째 숨긴다', () => {
    expect(
      buildChallengeCta({ ...joinable, ctaState: 'NONE' }).show
    ).toBe(false);
  });

  it('ctaState 가 없으면 기존 분기가 그대로 산다 (구서버)', () => {
    expect(buildChallengeCta(joinable).label).toBe('챌린지 참여하기');
  });

  it('호스트·참여중은 ctaState 보다 먼저다', () => {
    expect(
      buildChallengeCta({
        ...joinable,
        isParticipating: true,
        canWriteDiary: true,
        ctaState: 'RECRUIT_WAIT',
      }).label
    ).toBe('일지 작성하기');
  });
});
