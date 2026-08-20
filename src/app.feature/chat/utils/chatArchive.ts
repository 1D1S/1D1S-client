import { canSendInRoom, ChatRoom } from '../type/chat';
import { parseChatDate } from './chatFormat';

/**
 * 채팅방 보관(아카이브) 판정 — **화면은 여기만 본다**.
 *
 * 정책: 챌린지가 끝나도 채팅방은 7일 더 살아 있고(그동안은 그대로 전송
 * 가능), 종료 후 7일이 지나면(endDate+8일 00:00 KST) 보관된다. 보관은
 * 이미 "종료 + 읽기 전용" 이라, 리스트 배지에서 `종료`·`읽기 전용` 과
 * 나란히 서지 않고 그 둘을 대신한다.
 *
 * ⚠️ **`status` 로 판정하지 않는다.** 서버는 보관돼도 status 를 ACTIVE 로
 * 둔다 — 보관 여부는 `archived` 가 정본이고, 전송 가능 여부는 `canSend` 가
 * 정본이다(`canSendInChatRoom`).
 */
export function isChatArchived(room: ChatRoom, now = new Date()): boolean {
  if (typeof room.archived === 'boolean') {
    return room.archived;
  }
  // 아래 둘은 과도기용이다. `archived` 를 아직 안 싣는 배포에 붙었을 때만
  // 쓰이고, 그 배포에서는 보관 방이 READ_ONLY 로 잠겨 있었다.
  if (room.chatClosesAt) {
    const closesAt = parseChatDate(room.chatClosesAt);
    if (!Number.isNaN(closesAt.getTime())) {
      return now.getTime() >= closesAt.getTime();
    }
  }
  return room.challengeEnded && room.status === 'READ_ONLY';
}

/**
 * 이 방에 지금 보낼 수 있는가 — **입력창 잠금은 이것만 쓴다**.
 *
 * 서버 `canSend` 가 정본이다(status·멤버십·보관을 서버가 이미 합쳐 준다).
 * 클라가 같은 조건을 다시 조립하면 규칙이 두 벌이 되고, 한쪽만 바뀌는 날
 * 입력창이 "보낼 수 있는 척" 하거나 멀쩡한 방을 잠근다.
 */
export function canSendInChatRoom(room: ChatRoom, now = new Date()): boolean {
  if (typeof room.canSend === 'boolean') {
    return room.canSend;
  }
  // 과도기 폴백 — canSend 를 아직 안 싣는 배포용.
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
