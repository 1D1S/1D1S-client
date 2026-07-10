import { describe, expect, it, vi } from 'vitest';

import { buildChallengeCta, BuildChallengeCtaParams } from './challengeCta';

function makeParams(
  overrides: Partial<BuildChallengeCtaParams> = {}
): BuildChallengeCtaParams {
  return {
    isHost: false,
    isParticipating: false,
    isJoinRequestPending: false,
    isChallengeCurrentlyOngoing: false,
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
      makeParams({ isHost: true, isChallengeCurrentlyOngoing: true })
    );
    expect(cta.label).toBe('일지 작성하기');
    expect(cta.variant).toBe('primary');
    expect(cta.secondary?.label).toBe('챌린지 수정');
  });

  it('호스트 + 종료: 챌린지 수정 단독 노출', () => {
    const cta = buildChallengeCta(
      makeParams({ isHost: true, isChallengeCurrentlyOngoing: false })
    );
    expect(cta.label).toBe('챌린지 수정');
    expect(cta.disabled).toBe(false);
    expect(cta.secondary).toBeUndefined();
  });

  it('참여 중 + 진행 아님: 비활성 "진행 중이 아닙니다"', () => {
    const cta = buildChallengeCta(
      makeParams({ isParticipating: true, isChallengeCurrentlyOngoing: false })
    );
    expect(cta.label).toBe('진행 중이 아닙니다');
    expect(cta.disabled).toBe(true);
  });

  it('참여 중 + 진행 중 + 날짜 로딩: 일지 작성 비활성', () => {
    const cta = buildChallengeCta(
      makeParams({
        isParticipating: true,
        isChallengeCurrentlyOngoing: true,
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
