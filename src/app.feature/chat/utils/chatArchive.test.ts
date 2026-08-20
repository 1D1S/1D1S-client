import { describe, expect, it } from 'vitest';

import { ChatRoom } from '../type/chat';
import {
  canSendInChatRoom,
  formatChatClosesIn,
  isChatArchived,
} from './chatArchive';

const NOW = new Date('2026-08-17T12:00:00');

function room(overrides: Partial<ChatRoom> = {}): ChatRoom {
  return {
    roomId: 1,
    challengeId: 2,
    challengeTitle: '아침 러닝',
    status: 'ACTIVE',
    myRole: 'MEMBER',
    myMembershipStatus: 'ACTIVE',
    pushEnabled: true,
    unreadCount: 0,
    challengeEnded: false,
    ...overrides,
  };
}

describe('isChatArchived', () => {
  it('서버가 준 archived 가 정본이다', () => {
    expect(isChatArchived(room({ archived: true }), NOW)).toBe(true);
    // 파생 조건이 성립해도 서버가 false 라면 false.
    expect(
      isChatArchived(
        room({ archived: false, challengeEnded: true, status: 'READ_ONLY' }),
        NOW
      )
    ).toBe(false);
  });

  it('archived 가 없으면 chatClosesAt 경과 여부로 본다', () => {
    expect(
      isChatArchived(room({ chatClosesAt: '2026-08-18T12:00:00' }), NOW)
    ).toBe(false);
    expect(
      isChatArchived(room({ chatClosesAt: '2026-08-16T12:00:00' }), NOW)
    ).toBe(true);
  });

  it('보관돼도 status 는 ACTIVE 그대로다 — status 로 판정하지 않는다', () => {
    expect(
      isChatArchived(
        room({ archived: true, status: 'ACTIVE', challengeEnded: true }),
        NOW
      )
    ).toBe(true);
  });

  it('과도기 폴백: 둘 다 없으면 종료 + 방 자체가 READ_ONLY 일 때만', () => {
    // 종료 후 일주일 안 — 아직 보낼 수 있다.
    expect(isChatArchived(room({ challengeEnded: true }), NOW)).toBe(false);
    expect(
      isChatArchived(room({ challengeEnded: true, status: 'READ_ONLY' }), NOW)
    ).toBe(true);
    // 내가 방에서 빠진 것은 방이 보관된 것과 다르다.
    expect(
      isChatArchived(
        room({ challengeEnded: true, myMembershipStatus: 'READ_ONLY' }),
        NOW
      )
    ).toBe(false);
  });
});

describe('canSendInChatRoom', () => {
  it('서버 canSend 가 정본이다', () => {
    expect(canSendInChatRoom(room({ canSend: false }), NOW)).toBe(false);
    // 보관 방이라도 서버가 보낼 수 있다고 하면 그 말을 따른다 — 잠금 규칙을
    // 클라가 다시 조립하지 않는다.
    expect(
      canSendInChatRoom(room({ canSend: true, archived: true }), NOW)
    ).toBe(true);
  });

  it('과도기 폴백: canSend 가 없으면 상태 + 보관으로 판단한다', () => {
    // 종료 후 일주일 동안은 그대로 보낼 수 있다.
    expect(canSendInChatRoom(room({ challengeEnded: true }), NOW)).toBe(true);
    expect(canSendInChatRoom(room({ archived: true }), NOW)).toBe(false);
  });
});

describe('formatChatClosesIn', () => {
  it('하루 이상 남으면 일, 아니면 시간으로 말한다', () => {
    expect(formatChatClosesIn('2026-08-20T12:00:00', NOW)).toBe('3일');
    expect(formatChatClosesIn('2026-08-17T15:00:00', NOW)).toBe('3시간');
  });

  it('이미 지났거나 값이 없으면 아무 말도 하지 않는다', () => {
    expect(formatChatClosesIn('2026-08-16T12:00:00', NOW)).toBeNull();
    expect(formatChatClosesIn(null, NOW)).toBeNull();
    expect(formatChatClosesIn(undefined, NOW)).toBeNull();
  });
});
