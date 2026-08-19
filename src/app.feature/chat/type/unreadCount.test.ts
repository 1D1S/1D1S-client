import { describe, expect, it } from 'vitest';

import { type ChatReadState, unreadCountFor } from './chat';

// 방에 나(1)·상대(2)·상대(3) 셋. 메시지 10 은 내가 보냈다.
const MESSAGE = { id: 10, senderId: 1 };

function states(...entries: Array<[number, number | null]>): ChatReadState[] {
  return entries.map(([memberId, lastReadMessageId]) => ({
    memberId,
    lastReadMessageId,
  }));
}

describe('unreadCountFor', () => {
  it('발신자는 빼고 센다 — 내가 보낸 걸 내가 안 읽었다고 세지 않는다', () => {
    // 나는 아직 이 메시지를 읽음 위치에 올리지 않았지만 세면 안 된다.
    const all = states([1, null], [2, 10], [3, 10]);
    expect(unreadCountFor(MESSAGE, all)).toBe(0);
  });

  it('읽음 위치가 뒤면 안 읽은 것으로 센다', () => {
    expect(unreadCountFor(MESSAGE, states([1, 10], [2, 9], [3, 10]))).toBe(1);
    expect(unreadCountFor(MESSAGE, states([1, 10], [2, 9], [3, 5]))).toBe(2);
  });

  it('한 번도 안 읽은 멤버(null)도 안 읽은 것이다', () => {
    expect(unreadCountFor(MESSAGE, states([1, 10], [2, null]))).toBe(1);
  });

  it('읽음 위치가 그 메시지 이상이면 읽은 것이다', () => {
    expect(unreadCountFor(MESSAGE, states([1, 10], [2, 10], [3, 42]))).toBe(0);
  });

  it('아직 서버 id 가 없는 낙관적 말풍선은 세지 않는다', () => {
    expect(
      unreadCountFor({ id: 0, senderId: 1 }, states([2, null], [3, null]))
    ).toBe(0);
  });
});
