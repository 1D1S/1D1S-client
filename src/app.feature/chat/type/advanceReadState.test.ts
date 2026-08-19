import { describe, expect, it } from 'vitest';

import { advanceReadState, type ChatReadState } from './chat';

const states: ChatReadState[] = [
  { memberId: 1, lastReadMessageId: 10 },
  { memberId: 2, lastReadMessageId: null },
];

describe('advanceReadState', () => {
  it('앞으로 간 위치는 반영한다', () => {
    const next = advanceReadState(states, {
      memberId: 1,
      lastReadMessageId: 12,
    });
    expect(next.find((s) => s.memberId === 1)?.lastReadMessageId).toBe(12);
  });

  it('한 번도 안 읽던 멤버도 반영한다', () => {
    const next = advanceReadState(states, {
      memberId: 2,
      lastReadMessageId: 3,
    });
    expect(next.find((s) => s.memberId === 2)?.lastReadMessageId).toBe(3);
  });

  it('뒤로 가는 통지는 무시한다 — 사라진 안읽음이 되살아나면 안 된다', () => {
    const next = advanceReadState(states, {
      memberId: 1,
      lastReadMessageId: 5,
    });
    expect(next).toBe(states);
  });

  it('같은 위치는 그대로 둔다', () => {
    expect(
      advanceReadState(states, { memberId: 1, lastReadMessageId: 10 })
    ).toBe(states);
  });

  it('모르는 멤버는 새로 넣는다', () => {
    const next = advanceReadState(states, {
      memberId: 9,
      lastReadMessageId: 1,
    });
    expect(next).toHaveLength(3);
  });

  it('다른 멤버 위치는 건드리지 않는다', () => {
    const next = advanceReadState(states, {
      memberId: 1,
      lastReadMessageId: 20,
    });
    expect(next.find((s) => s.memberId === 2)?.lastReadMessageId).toBeNull();
  });
});
