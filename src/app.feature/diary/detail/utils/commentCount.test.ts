import { describe, expect, it } from 'vitest';

import type { DiaryComment } from '../type/comment';
import { getDiaryCommentTotal } from './commentCount';

function makeComment(overrides: Partial<DiaryComment>): DiaryComment {
  const base: DiaryComment = {
    id: 1,
    parentCommentId: null,
    author: { id: 1, nickname: '유저', profileImage: null },
    content: '내용',
    createdAt: '2026-01-01T00:00:00Z',
    replyCount: 0,
    isDeleted: false,
  };
  return { ...base, ...overrides };
}

describe('getDiaryCommentTotal', () => {
  it('대댓글 없으면 totalElements 그대로', () => {
    const items = [makeComment({ id: 1 }), makeComment({ id: 2 })];
    expect(
      getDiaryCommentTotal({ totalElements: 2, items, repliesMap: {} })
    ).toBe(2);
  });

  it('replyCount 를 우선 합산한다', () => {
    const items = [
      makeComment({ id: 1, replyCount: 3 }),
      makeComment({ id: 2, replyCount: 1 }),
    ];
    expect(
      getDiaryCommentTotal({ totalElements: 2, items, repliesMap: {} })
    ).toBe(6);
  });

  it('replyCount 가 0 이면 repliesMap 길이로 보정한다', () => {
    const items = [makeComment({ id: 1, replyCount: 0 })];
    const repliesMap = {
      1: [makeComment({ id: 11 }), makeComment({ id: 12 })],
    };
    expect(getDiaryCommentTotal({ totalElements: 1, items, repliesMap })).toBe(
      3
    );
  });

  it('replyCount>0 이면 repliesMap 보정을 쓰지 않는다', () => {
    const items = [makeComment({ id: 1, replyCount: 5 })];
    const repliesMap = { 1: [makeComment({ id: 11 })] };
    expect(getDiaryCommentTotal({ totalElements: 1, items, repliesMap })).toBe(
      6
    );
  });
});
