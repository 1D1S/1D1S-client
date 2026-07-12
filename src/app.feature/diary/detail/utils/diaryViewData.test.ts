import { describe, expect, it } from 'vitest';

import type { ChallengeDetailResponse } from '../../../challenge/board/type/challenge';
import type { DiaryDetail } from '../../board/type/diary';
import type { DiaryComment } from '../type/comment';
import {
  feelingToMoodImage,
  hasVisibleHtmlContent,
  mapDiaryToViewData,
  parseCommentTimestamp,
  parsePositiveInteger,
  resolveSidebarMemberId,
  sortCommentsByOldest,
} from './diaryViewData';

describe('feelingToMoodImage', () => {
  it('maps each mood to its image, NONE to null', () => {
    expect(feelingToMoodImage('HAPPY')?.src).toBe('/images/mood-happy.svg');
    expect(feelingToMoodImage('SAD')?.src).toBe('/images/mood-sad.svg');
    expect(feelingToMoodImage('NORMAL')?.src).toBe('/images/mood-soso.svg');
    expect(feelingToMoodImage('NONE')).toBeNull();
  });
});

describe('hasVisibleHtmlContent', () => {
  it('is false for empty and whitespace-only content', () => {
    expect(hasVisibleHtmlContent('')).toBe(false);
    expect(hasVisibleHtmlContent('<p></p>')).toBe(false);
    expect(hasVisibleHtmlContent('<p>&nbsp;</p>')).toBe(false);
    expect(hasVisibleHtmlContent('<p>   </p>')).toBe(false);
  });

  it('is true for visible text', () => {
    expect(hasVisibleHtmlContent('<p>안녕</p>')).toBe(true);
  });

  it('is true when an image tag is present', () => {
    expect(hasVisibleHtmlContent('<img src="x" />')).toBe(true);
  });
});

describe('parsePositiveInteger', () => {
  it('accepts positive integers and numeric strings', () => {
    expect(parsePositiveInteger(5)).toBe(5);
    expect(parsePositiveInteger('7')).toBe(7);
  });

  it('rejects zero, negatives, decimals and junk', () => {
    expect(parsePositiveInteger(0)).toBeNull();
    expect(parsePositiveInteger(-1)).toBeNull();
    expect(parsePositiveInteger(3.5)).toBeNull();
    expect(parsePositiveInteger('x')).toBeNull();
    expect(parsePositiveInteger(true)).toBeNull();
  });
});

describe('resolveSidebarMemberId', () => {
  it('reads memberId first, then id', () => {
    expect(resolveSidebarMemberId({ memberId: 5 })).toBe(5);
    expect(resolveSidebarMemberId({ id: 9 })).toBe(9);
    expect(resolveSidebarMemberId({ memberId: 5, id: 9 })).toBe(5);
  });

  it('ignores disproven keys (member_id, userId, user_id)', () => {
    expect(resolveSidebarMemberId({ member_id: 8 })).toBeNull();
    expect(resolveSidebarMemberId({ userId: 2 })).toBeNull();
    expect(resolveSidebarMemberId({ user_id: 3 })).toBeNull();
  });

  it('returns null for non-objects and empty ids', () => {
    expect(resolveSidebarMemberId(null)).toBeNull();
    expect(resolveSidebarMemberId({})).toBeNull();
    expect(resolveSidebarMemberId({ id: 0 })).toBeNull();
  });
});

describe('parseCommentTimestamp', () => {
  it('returns 0 for an empty value', () => {
    expect(parseCommentTimestamp('')).toBe(0);
  });

  it('parses an ISO timestamp', () => {
    expect(parseCommentTimestamp('2026-07-10T00:00:00Z')).toBe(
      new Date('2026-07-10T00:00:00Z').getTime()
    );
  });

  it('truncates sub-millisecond precision before parsing', () => {
    expect(parseCommentTimestamp('2026-07-10T00:00:00.123456Z')).toBe(
      new Date('2026-07-10T00:00:00.123Z').getTime()
    );
  });
});

describe('sortCommentsByOldest', () => {
  it('sorts oldest first and breaks ties by id', () => {
    const comments = [
      { id: 3, createdAt: '2026-07-10T10:00:00Z' },
      { id: 1, createdAt: '2026-07-10T09:00:00Z' },
      { id: 2, createdAt: '2026-07-10T09:00:00Z' },
    ] as DiaryComment[];
    const ids = sortCommentsByOldest(comments).map((item) => item.id);
    expect(ids).toEqual([1, 2, 3]);
  });
});

describe('mapDiaryToViewData', () => {
  it('maps a diary with no linked challenge', () => {
    // 서버 확정 계약: 상세 응답은 diaryInfo(Dto 접미사 없음)로 내려온다.
    const diary = {
      id: 42,
      challenge: null,
      author: null,
      title: '',
      content: '<p>오늘의 일지</p>',
      imgUrl: null,
      thumbnailUrl: null,
      likeInfo: { likedByMe: true, likeCnt: 7 },
      diaryInfo: {
        createdAt: '2026-07-10',
        feeling: 'HAPPY',
        achievementRate: 150,
      },
    } as unknown as DiaryDetail;

    const view = mapDiaryToViewData(diary);

    expect(view.id).toBe(42);
    expect(view.title).toBe('제목 없는 일지');
    expect(view.feeling).toBe('HAPPY');
    expect(view.feelingLabel).toBe('아주 좋음');
    expect(view.feelingEmoji).toBe('😊');
    expect(view.achievementPercent).toBe(100);
    expect(view.likedByMe).toBe(true);
    expect(view.likeCount).toBe(7);
    expect(view.hasContentHtml).toBe(true);
    expect(view.connectedChallengeId).toBeNull();
    expect(view.connectedChallengeTitle).toBe('연동된 챌린지가 없습니다.');
    expect(view.contentImageUrls).toEqual([]);
  });

  it('reads author and challenge.challengeId from the confirmed shape', () => {
    const diary = {
      id: 7,
      challenge: { challengeId: 99, title: '아침 러닝' },
      author: { id: 3, nickname: '러너', profileImage: null },
      title: '일지',
      content: '<p>내용</p>',
      imgUrl: ['https://cdn.example.com/a.jpg'],
      thumbnailUrl: null,
      likeInfo: { likedByMe: false, likeCnt: 0 },
      diaryInfo: { feeling: 'NONE', achievementRate: 40 },
    } as unknown as DiaryDetail;

    const view = mapDiaryToViewData(diary);

    expect(view.authorId).toBe(3);
    expect(view.authorName).toBe('러너');
    expect(view.connectedChallengeId).toBe(99);
    expect(view.connectedChallengeTitle).toBe('아침 러닝');
    expect(view.achievementPercent).toBe(40);
    expect(view.contentImageUrls).toEqual(['https://cdn.example.com/a.jpg']);
  });

  it('carries challengeType from challengeSummary so the badge can read it', () => {
    const diary = {
      id: 8,
      challenge: null,
      author: null,
      title: '일지',
      content: '<p>내용</p>',
      imgUrl: null,
      thumbnailUrl: null,
      likeInfo: { likedByMe: false, likeCnt: 0 },
      diaryInfo: { feeling: 'NONE', achievementRate: 0 },
    } as unknown as DiaryDetail;
    const challengeDetailData = {
      challengeSummary: {
        challengeId: 5,
        title: '공식 챌린지',
        participantCnt: 0,
        challengeType: 'OFFICIAL',
      },
    } as unknown as ChallengeDetailResponse;

    const view = mapDiaryToViewData(diary, challengeDetailData);

    // 공식 챌린지 배지가 challengeType 을 읽어 0명이어도 종료로 보지 않게 한다.
    expect(view.connectedChallengeSummary?.challengeType).toBe('OFFICIAL');
  });
});
