import { describe, expect, it } from 'vitest';

import type { ChallengeListItem } from '../type/challenge';
import {
  CHALLENGE_SECTIONS,
  pickSectionItems,
  SECTION_LIMIT,
  sectionMoreHref,
  toSectionParams,
} from './challengeSections';

function item(id: number, startDate: string): ChallengeListItem {
  return {
    challengeId: id,
    title: `챌린지 ${id}`,
    category: 'BOOK',
    startDate,
    endDate: '2026-12-31',
    maxParticipantCnt: 0,
    goalType: 'FIXED',
    participationType: 'INDIVIDUAL',
    participantCnt: 1,
    liked: false,
    likeCnt: 0,
  };
}

describe('섹션 구성', () => {
  it('보상 → 오늘 시작 → 카테고리 순이다', () => {
    expect(CHALLENGE_SECTIONS[0].kind).toBe('reward');
    expect(CHALLENGE_SECTIONS[1].kind).toBe('todayStart');
    expect(CHALLENGE_SECTIONS[2].kind).toBe('category');
  });

  it('카테고리 섹션만 전체보기를 건다', () => {
    expect(sectionMoreHref(CHALLENGE_SECTIONS[0])).toBeUndefined();
    expect(sectionMoreHref(CHALLENGE_SECTIONS[1])).toBeUndefined();
    expect(sectionMoreHref(CHALLENGE_SECTIONS[2])).toMatch(
      /^\/challenge\/category\/[A-Z_]+$/
    );
  });
});

describe('조회 조건', () => {
  it('종료된 챌린지를 서버에서 거른다', () => {
    const params = toSectionParams(CHALLENGE_SECTIONS[2]);
    expect(params.status).toEqual(['UPCOMING', 'ONGOING']);
  });

  it('보상 섹션은 rewardOnly 로 받는다', () => {
    expect(toSectionParams(CHALLENGE_SECTIONS[0]).rewardOnly).toBe(true);
  });

  it('오늘 시작은 진행 중을 넉넉히 받아 와서 고른다', () => {
    const params = toSectionParams(CHALLENGE_SECTIONS[1]);
    expect(params.status).toEqual(['ONGOING']);
    expect(params.limit).toBeGreaterThan(SECTION_LIMIT);
  });
});

describe('섹션 항목 고르기', () => {
  const now = new Date('2026-09-10T09:00:00');

  it('오늘 시작한 것만 남긴다', () => {
    const picked = pickSectionItems(
      CHALLENGE_SECTIONS[1],
      [item(1, '2026-09-10'), item(2, '2026-09-09'), item(3, '2026-09-10')],
      now
    );
    expect(picked.map((entry) => entry.challengeId)).toEqual([1, 3]);
  });

  it('다른 섹션은 앞에서 다섯 장까지', () => {
    const many = Array.from({ length: 9 }, (_, index) =>
      item(index, '2026-09-01')
    );
    expect(pickSectionItems(CHALLENGE_SECTIONS[2], many, now)).toHaveLength(
      SECTION_LIMIT
    );
  });

  it('빈 응답은 빈 배열 — 화면이 줄째 생략한다', () => {
    expect(pickSectionItems(CHALLENGE_SECTIONS[2], [], now)).toEqual([]);
  });
});
