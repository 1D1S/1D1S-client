import { describe, expect, it } from 'vitest';

import { toChallengeCardProps } from './challengeCardProps';

const BASE = {
  title: '테스트',
  startDate: '2026-09-01',
  endDate: '2026-09-30',
  participantCnt: 1,
};

function props(extra: Record<string, unknown> = {}) {
  return toChallengeCardProps(
    { ...BASE, ...extra },
    '/challenge/1',
    new Date('2026-09-10')
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
