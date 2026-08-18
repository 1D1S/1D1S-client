import { ChatRoom } from '../type/chat';

function isSameDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

/**
 * 서버는 LocalDateTime 을 타임존 없이 보낸다. `new Date('...')` 는 그런
 * 문자열을 (ISO 로 보고) UTC 로 읽어 9시간 어긋난다 — 로컬로 파싱한다.
 */
export function parseChatDate(value: string): Date {
  const hasZone = /[Zz]|[+-]\d{2}:?\d{2}$/.test(value);
  return new Date(hasZone ? value : `${value.replace(' ', 'T')}`);
}

/** 마지막 메시지 시각 — 카톡 관행(오늘은 시각, 어제는 "어제", 그 밖은 날짜). */
export function formatRoomTime(value: string, now = new Date()): string {
  const at = parseChatDate(value);
  if (Number.isNaN(at.getTime())) {
    return '';
  }
  if (isSameDay(at, now)) {
    const hour12 = at.getHours() % 12 === 0 ? 12 : at.getHours() % 12;
    const period = at.getHours() < 12 ? '오전' : '오후';
    const minute = String(at.getMinutes()).padStart(2, '0');
    return `${period} ${hour12}:${minute}`;
  }
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameDay(at, yesterday)) {
    return '어제';
  }
  return `${at.getMonth() + 1}월 ${at.getDate()}일`;
}

/** 말풍선 옆 시각. 날짜 구분선이 날짜를 맡으므로 시:분만 쓴다. */
export function formatBubbleTime(value: string): string {
  const at = parseChatDate(value);
  if (Number.isNaN(at.getTime())) {
    return '';
  }
  const hour12 = at.getHours() % 12 === 0 ? 12 : at.getHours() % 12;
  const period = at.getHours() < 12 ? '오전' : '오후';
  return `${period} ${hour12}:${String(at.getMinutes()).padStart(2, '0')}`;
}

/** 날짜 구분선 라벨. */
export function formatDateDivider(value: string): string {
  const at = parseChatDate(value);
  if (Number.isNaN(at.getTime())) {
    return '';
  }
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][at.getDay()];
  return `${at.getFullYear()}년 ${at.getMonth() + 1}월 ${at.getDate()}일 (${weekday})`;
}

/** 같은 날인지 — 날짜 구분선을 넣을 자리를 가른다. */
export function isSameChatDay(left: string, right: string): boolean {
  return isSameDay(parseChatDate(left), parseChatDate(right));
}

/**
 * 방 한 줄에 뭘 보여 줄지. 마지막 메시지 > 공지 > 안내 순서다 — 대화가
 * 오간 방에서 공지가 계속 자리를 차지하면 목록이 안 움직인다.
 */
export function roomPreview(room: ChatRoom): string {
  const last = room.lastMessage;
  if (last && last.preview.trim()) {
    return `${last.senderNickname}: ${last.preview.replace(/\n/g, ' ')}`;
  }
  const notice = room.notice?.content;
  if (notice && notice.trim()) {
    return `공지 · ${notice.replace(/\n/g, ' ')}`;
  }
  return '메시지를 보내 대화를 시작해 보세요';
}
