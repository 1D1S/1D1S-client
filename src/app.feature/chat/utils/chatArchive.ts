import { canSendInRoom, ChatRoom } from '../type/chat';
import { parseChatDate } from './chatFormat';

/**
 * 채팅방 보관(아카이브) 판정 — **화면은 여기만 본다**.
 *
 * 정책: 챌린지가 끝나도 채팅방은 7일 더 살아 있고(그동안은 그대로 전송
 * 가능), 7일이 지나면 읽기 전용으로 잠긴다. 그 잠긴 상태가 "아카이브" 다.
 * 즉 **아카이브 = 종료 + 7일 경과 읽기 전용**이라, 리스트 배지에서
 * `종료`·`읽기 전용` 과 나란히 서지 않고 그 둘을 대신한다.
 *
 * ⚠️ 서버가 `ChatRoomResponse` 에 보관 필드를 확정하는 중이다. 확정된
 * 이름이 오면 아래 두 곳(`room.archived`, `room.chatClosesAt`)만 바꾸면
 * 되고, 호출부는 손대지 않는다.
 *
 * 확정 전에도 오늘 있는 필드로 정확히 판정된다: 서버가 7일이 지난 방을
 * READ_ONLY 로 잠그므로 `challengeEnded && status === 'READ_ONLY'` 가 곧
 * 보관 상태다. `myMembershipStatus` 는 보지 않는다 — 내가 방에서 빠진 것과
 * 방이 보관된 것은 다른 일이다.
 */
export function isChatArchived(room: ChatRoom, now = new Date()): boolean {
  if (typeof room.archived === 'boolean') {
    return room.archived;
  }
  if (room.chatClosesAt) {
    const closesAt = parseChatDate(room.chatClosesAt);
    if (!Number.isNaN(closesAt.getTime())) {
      return now.getTime() >= closesAt.getTime();
    }
  }
  return room.challengeEnded && room.status === 'READ_ONLY';
}

/**
 * 이 방에 지금 보낼 수 있는가. `canSendInRoom`(방·멤버십 상태)에 보관
 * 여부를 얹은 최종 판정이다 — 화면은 이것만 쓴다.
 */
export function canSendInChatRoom(room: ChatRoom, now = new Date()): boolean {
  return canSendInRoom(room) && !isChatArchived(room, now);
}

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

/**
 * 전송이 막히기까지 남은 기간. 서버가 `chatClosesAt` 을 아직 안 주면
 * null — 그때는 배너가 기간 없이 정책만 안내한다.
 */
export function formatChatClosesIn(
  chatClosesAt?: string | null,
  now = new Date()
): string | null {
  if (!chatClosesAt) {
    return null;
  }
  const closesAt = parseChatDate(chatClosesAt);
  if (Number.isNaN(closesAt.getTime())) {
    return null;
  }
  const remaining = closesAt.getTime() - now.getTime();
  if (remaining <= 0) {
    return null;
  }
  if (remaining >= DAY_MS) {
    return `${Math.ceil(remaining / DAY_MS)}일`;
  }
  // 하루가 안 남았으면 "0일" 이 아니라 시간으로 말한다.
  return `${Math.max(1, Math.ceil(remaining / HOUR_MS))}시간`;
}
