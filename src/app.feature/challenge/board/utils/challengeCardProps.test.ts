import { describe, expect, it } from 'vitest';

import {
  challengeRecruitCountdownLabel,
  nextRecruitOccurrence,
  toChallengeCardProps,
} from './challengeCardProps';

const BASE = {
  title: '테스트',
  startDate: '2026-09-01',
  endDate: '2026-09-30',
  participantCnt: 1,
};

function props(extra: Record<string, unknown> = {}, now?: Date) {
  return toChallengeCardProps(
    { ...BASE, ...extra },
    '/challenge/1',
    now ?? new Date('2026-09-10')
  );
}

describe('호스트', () => {
  it('닉네임·프사·레벨을 목록 응답 그대로 싣는다', () => {
    expect(
      props({
        hostMemberNickname: '노근',
        hostProfileImage: 'https://cdn/p.jpg',
        hostLevel: 4,
      }).host
    ).toEqual({
      nickname: '노근',
      profileImg: 'https://cdn/p.jpg',
      level: 4,
    });
  });

  it('닉네임이 없으면 그리지 않는다', () => {
    expect(props().host).toBeNull();
    expect(props({ hostMemberNickname: '  ' }).host).toBeNull();
  });
});

describe('대표책', () => {
  it('bookCount 가 0 이면 책 바를 그리지 않는다', () => {
    expect(
      props({ bookCount: 0, representativeBookTitle: '이 사람을 보라' }).book
    ).toBeNull();
  });

  it('한 권이면 "외 N권" 이 붙지 않는다', () => {
    expect(
      props({
        bookCount: 1,
        representativeBookTitle: '이 사람을 보라',
        representativeBookThumbnailUrl: 'https://cdn/b.jpg',
      }).book
    ).toEqual({
      title: '이 사람을 보라',
      coverUrl: 'https://cdn/b.jpg',
      moreCount: 0,
    });
  });

  it('여러 권이면 대표책을 뺀 나머지를 센다', () => {
    expect(
      props({ bookCount: 3, representativeBookTitle: '파이어 펀치 1' }).book
    ).toMatchObject({ moreCount: 2 });
  });

  it('표지 URL 을 변환하지 않고 그대로 쓴다', () => {
    const cover = 'https://search1.kakaocdn.net/thumb/R120x174.q85/?fname=x';
    expect(
      props({
        bookCount: 1,
        representativeBookTitle: '책',
        representativeBookThumbnailUrl: cover,
      }).book?.coverUrl
    ).toBe(cover);
  });
});

describe('회차 단계 (phase 우선)', () => {
  it('RECRUITING 은 모집 중이라고 말한다', () => {
    expect(
      props({
        occurrencePhase: 'RECRUITING',
        startDate: '2026-09-13',
      }).statusPieces
    ).toEqual(['모집 중', '3일 뒤 (일) 시작']);
  });

  it('phase 가 status 를 이긴다 — status 는 모집 중을 표현 못 한다', () => {
    const p = props({
      occurrencePhase: 'RECRUITING',
      occurrenceStatus: 'SCHEDULED',
      startDate: '2026-09-13',
    });
    expect(p.status).toBe('UPCOMING');
    expect(p.statusPieces).toContain('모집 중');
  });

  it('ACTIVE 는 날짜와 무관하게 진행 중이다', () => {
    expect(
      props({
        occurrencePhase: 'ACTIVE',
        startDate: '2027-01-01',
        endDate: '2027-02-01',
      }).status
    ).toBe('ONGOING');
  });

  it('CLOSED 는 종료로 본다', () => {
    expect(props({ occurrencePhase: 'CLOSED' }).status).toBe('ENDED');
  });

  it('phase 가 없으면 occurrenceStatus 로 떨어진다', () => {
    expect(props({ occurrenceStatus: 'OPEN' }).status).toBe('ONGOING');
  });

  it('둘 다 없으면 기존 날짜 계산 (구서버)', () => {
    expect(props().status).toBe('ONGOING');
  });
});

describe('미리지원 배지', () => {
  it('PRE_APPLY 일 때만 붙는다', () => {
    expect(props({ ctaState: 'PRE_APPLY' }).canPreApply).toBe(true);
    expect(props({ ctaState: 'JOIN' }).canPreApply).toBe(false);
    expect(props().canPreApply).toBe(false);
  });
});

describe('모집 카운트다운', () => {
  const now = new Date('2026-09-10');

  it('남은 날짜를 D-N 으로 읽어 준다', () => {
    expect(challengeRecruitCountdownLabel('2026-09-15', now)).toBe(
      '다음 모집 D-5 · 9.15 시작'
    );
  });

  it('오늘 열리면 그렇게 말한다', () => {
    expect(challengeRecruitCountdownLabel('2026-09-10', now)).toBe(
      '오늘 모집 시작 · 9.10'
    );
  });

  it('모집일이 없으면 빈 문자열 — 안 그린다', () => {
    expect(challengeRecruitCountdownLabel(null, now)).toBe('');
  });
});

describe('다음 모집 회차 고르기', () => {
  it('모집창이 있는 SCHEDULED 회차만 고른다', () => {
    const picked = nextRecruitOccurrence([
      { occurrenceId: 1, challengeId: 9, occurrenceNo: 1, phase: 'CLOSED',
        startDate: '2026-08-01', endDate: '2026-08-31' },
      { occurrenceId: 2, challengeId: 9, occurrenceNo: 2, phase: 'SCHEDULED',
        startDate: '2026-10-01', endDate: '2026-10-31' },
      { occurrenceId: 3, challengeId: 9, occurrenceNo: 3, phase: 'SCHEDULED',
        recruitStartDate: '2026-09-20', recruitEndDate: '2026-09-30',
        startDate: '2026-11-01', endDate: '2026-11-30' },
    ]);
    expect(picked?.occurrenceId).toBe(3);
  });

  it('회차가 없으면 null', () => {
    expect(nextRecruitOccurrence(null)).toBeNull();
  });
});

describe('상태 조각', () => {
  const now = new Date('2026-09-10');

  it('진행 중은 조각으로 나뉜다 — 뒤에서부터 버릴 수 있게', () => {
    expect(
      props({ startDate: '2026-09-01', endDate: '2026-09-20' }, now)
        .statusPieces
    ).toEqual(['진행 중', 'D-10']);
  });

  it('단체 챌린지만 중도 참여 가부를 말한다', () => {
    expect(
      props(
        {
          startDate: '2026-09-01',
          endDate: '2026-09-20',
          participationType: 'GROUP',
          allowMidJoin: true,
        },
        now
      ).statusPieces
    ).toEqual(['진행 중', 'D-10', '참여 가능']);
    expect(
      props(
        {
          startDate: '2026-09-01',
          endDate: '2026-09-20',
          participationType: 'GROUP',
          allowMidJoin: false,
        },
        now
      ).statusPieces
    ).toEqual(['진행 중', 'D-10', '참여 마감']);
  });

  it('개인 챌린지는 참여 가부 조각이 없다', () => {
    expect(
      props({ startDate: '2026-09-01', endDate: '2026-09-20' }, now)
        .statusPieces
    ).toHaveLength(2);
  });

  it('종료는 한 조각뿐이다', () => {
    expect(
      props({ startDate: '2026-01-01', endDate: '2026-02-01' }, now)
        .statusPieces
    ).toEqual(['종료됨']);
  });
});
