// 그룹 챌린지 채팅 계약. 앱(_1d1s_app/lib/features/chat/data/chat_api.dart)과
// 같은 서버 DTO 를 본다 — 이름/옵셔널 여부를 앱 쪽과 어긋나게 두지 않는다.

export const CHAT_MESSAGE_TYPES = [
  'TEXT',
  'IMAGE',
  'CHALLENGE_SHARE',
  'DIARY_SHARE',
  // 공지 설정/해제 안내. 클라가 보내면 서버가 CHAT-005 로 막는다.
  'SYSTEM',
  // 통계 자랑. 보낼 땐 statsVariant 만 고르고 숫자는 서버가 채운다.
  'STATS_SHARE',
] as const;

export type ChatMessageType = (typeof CHAT_MESSAGE_TYPES)[number];

/** 공유 카드 내용(ChatShareResponse). */
export interface ChatShare {
  targetId: number;
  title?: string | null;
  subtitle?: string | null;
  thumbnailUrl?: string | null;
  /** 대표 이미지가 없을 때 쓸 카테고리. 일지는 속한 챌린지 카테고리. */
  category?: string | null;
  /** false 면 삭제·비공개·차단 — 제목·썸네일이 오지 않는다. */
  available: boolean;
}

/** 본문 링크 미리보기(ChatLinkPreviewResponse). */
export interface ChatLinkPreview {
  url: string;
  title?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  siteName?: string | null;
}

/** 통계 카드 레이아웃. 그리는 모양만 고르는 값이다. */
export const CHAT_STATS_VARIANTS = [
  'WEEK',
  'CURRENT_STREAK',
  'MAX_STREAK',
] as const;

export type ChatStatsVariant = (typeof CHAT_STATS_VARIANTS)[number];

/**
 * 통계 자랑 카드 내용(ChatStatsShareResponse).
 *
 * **숫자는 variant 와 무관하게 항상 다 온다** — 서버 계약 그대로다. 화면은
 * 고른 레이아웃에 필요한 값만 골라 그리고, 값을 다시 계산하지 않는다.
 * 박제된 시점의 기록이라 지금 값과 다를 수 있는 것이 정상이다.
 */
export interface ChatStatsShare {
  /** 없으면 WEEK. variant 가 없던 시절 카드가 그렇게 온다. */
  variant?: ChatStatsVariant | null;
  capturedAt: string;
  /** 집계한 주의 월요일(KST). */
  weekStart: string;
  currentStreak: number;
  maxStreak: number;
  /** 이번 주에 쓴 일지 수. 하루 여러 편이면 그만큼 늘어난다. */
  weekDiaryCount: number;
  /** 이번 주에 일지를 쓴 날짜(오름차순, 하루 한 번). */
  weekDates: string[];
  totalDiaryCount: number;
}

export interface ChatMessage {
  id: number;
  roomId: number;
  senderId: number;
  senderNickname: string;
  /** 전송 멱등키. 낙관적 말풍선을 서버 확정본으로 교체할 때 쓴다. */
  clientMessageId?: string | null;
  type: ChatMessageType;
  content?: string | null;
  imageUrl?: string | null;
  /** ACTIVE | HIDDEN — HIDDEN 이면 content/imageUrl 이 null 이다. */
  status: 'ACTIVE' | 'HIDDEN';
  createdAt: string;
  share?: ChatShare | null;
  linkPreview?: ChatLinkPreview | null;
  stats?: ChatStatsShare | null;
  /** 서버 응답에는 없는 클라 전용 표시. */
  pending?: boolean;
  failed?: boolean;
}

/** 방 목록 미리보기(ChatLastMessageResponse). preview 는 서버가 완성한다. */
export interface ChatLastMessage {
  messageId: number;
  type: ChatMessageType;
  preview: string;
  senderNickname: string;
  createdAt: string;
}

export interface ChatRoom {
  roomId: number;
  challengeId: number;
  challengeTitle: string;
  challengeThumbnailUrl?: string | null;
  category?: string | null;
  /** ACTIVE | READ_ONLY — 방 자체가 읽기 전용인지. */
  status: 'ACTIVE' | 'READ_ONLY';
  myRole: 'HOST' | 'MEMBER';
  /** ACTIVE | READ_ONLY — 내 멤버십. */
  myMembershipStatus: 'ACTIVE' | 'READ_ONLY';
  pushEnabled: boolean;
  unreadCount: number;
  notice?: ChatMessage | null;
  lastMessage?: ChatLastMessage | null;
  /**
   * 챌린지가 끝났는가. 자연 종료 방은 READ_ONLY 로 잠기지 않으므로
   * status 로는 알 수 없다 — 서버가 주는 이 값이 정본이다.
   */
  challengeEnded: boolean;

  /**
   * 보관 상태 — 챌린지 종료 후 7일 경과(endDate+8일 00:00 KST 부터).
   * **status 는 보관돼도 ACTIVE 그대로다** — 보관 판정에 status 를 쓰면 안 된다.
   * 태그·필터가 이 값을 쓴다. 화면은 `utils/chatArchive.ts` 를 거쳐 읽는다.
   */
  archived?: boolean;

  /** 전송이 막히는 시각(종료 + 7일). 남은 기간 안내에 쓴다. */
  chatClosesAt?: string | null;

  /**
   * 서버의 최종 전송 가능 판정(= status ACTIVE && 멤버십 ACTIVE && !archived).
   * **입력창 잠금은 이 값이 정본이다** — 클라가 조건을 다시 조립하지 않는다.
   */
  canSend?: boolean;

  /**
   * 방 참여자 수. 목록에서 제목 옆에 "N명" 으로 붙는다.
   * ⚠️ 서버가 아직 안 준다 — 오면 그대로 켜진다(자리만 잡아 둔 값).
   */
  memberCount?: number;
}

export interface ChatRoomList {
  rooms: ChatRoom[];
  /** 실시간 수신 필터용(내가 차단 ∪ 나를 차단). */
  hiddenMemberIds: number[];
}

/** 메시지 내역 한 페이지. 커서형이고 최신순이다. */
export interface ChatMessagePage {
  items: ChatMessage[];
  pageInfo: {
    limit?: number;
    hasNextPage: boolean;
    nextCursor?: string | null;
  };
}

/** 붙여넣은 링크가 공유 카드가 될 수 있는지에 대한 서버 판정. */
export interface ChatShareResolution {
  shareable: boolean;
  /** CHALLENGE_SHARE | DIARY_SHARE. 우리 링크가 아니면 없다. */
  type?: 'CHALLENGE_SHARE' | 'DIARY_SHARE' | null;
  targetId?: number | null;
  share?: ChatShare | null;
}

/** 멤버 한 명의 읽음 위치(ChatReadStatesResponse.MemberReadState). */
export interface ChatReadState {
  memberId: number;
  /** null 이면 이 방에서 한 번도 안 읽었다. */
  lastReadMessageId?: number | null;
}

export interface ChatReadStates {
  roomId: number;
  /** 지금 방에 있는 멤버 전원. 나간 멤버는 빠진다. */
  members: ChatReadState[];
}

/** 읽음 위치가 옮겨졌다는 통지(/topic/chat/rooms/{id}/read). */
export interface ChatReadReceipt {
  roomId: number;
  memberId: number;
  lastReadMessageId?: number | null;
}

/**
 * 이 메시지를 아직 안 읽은 사람 수.
 *
 * **발신자는 빼고 센다.** 메시지마다 발신자가 다르므로 서버가 미리 빼 줄 수
 * 없어(서버 DTO 주석의 계약) 클라가 계산한다. 서버는 멤버별 읽음 "위치"
 * 하나만 주고, 갱신도 그 한 줄만 온다 — 메시지마다 개수를 실으면 비용도
 * 크고 찍는 순간 낡는다.
 *
 * 0 이면 모두 읽은 것이므로 화면에서 숨긴다.
 */
export function unreadCountFor(
  message: Pick<ChatMessage, 'id' | 'senderId'>,
  states: ChatReadState[]
): number {
  // 아직 서버 id 가 없는 낙관적 말풍선은 셀 기준이 없다.
  if (message.id <= 0) {
    return 0;
  }
  return states.filter((state) => {
    if (state.memberId === message.senderId) {
      return false;
    }
    const read = state.lastReadMessageId;
    return read == null || read < message.id;
  }).length;
}

/**
 * 한 멤버의 읽음 위치를 앞으로만 옮긴다.
 *
 * 위치는 앞으로만 간다는 계약이지만, 통지가 순서를 바꿔 도착하거나 내가
 * 낙관적으로 올린 값보다 낮은 브로드캐스트가 뒤늦게 와도 **뒤로 밀리지
 * 않아야** 한다 — 밀리면 이미 사라진 안읽음 숫자가 되살아난다.
 */
export function advanceReadState(
  states: ChatReadState[],
  next: ChatReadState
): ChatReadState[] {
  const before = states.find((state) => state.memberId === next.memberId);
  if (!before) {
    return [...states, next];
  }
  const previous = before.lastReadMessageId ?? -1;
  const incoming = next.lastReadMessageId ?? -1;
  if (incoming <= previous) {
    return states;
  }
  return states.map((state) =>
    state.memberId === next.memberId ? next : state
  );
}

/** 신고 사유(ChatReportReason). 서버 enum 과 순서까지 맞춘다. */
export const CHAT_REPORT_REASONS = [
  { value: 'SPAM', label: '스팸 / 광고' },
  { value: 'ABUSE', label: '욕설 / 괴롭힘' },
  { value: 'SEXUAL', label: '선정적인 내용' },
  { value: 'HATE', label: '혐오 표현' },
  { value: 'OTHER', label: '기타 사유' },
] as const;

export type ChatReportReason = (typeof CHAT_REPORT_REASONS)[number]['value'];

export interface ChatReportRequest {
  reason: ChatReportReason;
  /** 서버 @Size(max = 500). 기타 사유일 때만 필수로 받는다. */
  detail?: string;
}

export interface ChatSendRequest {
  clientMessageId: string;
  type: ChatMessageType;
  content?: string;
  imageUploadId?: string;
  sharedTargetId?: number;
  /**
   * STATS_SHARE 의 레이아웃. 생략하면 서버가 WEEK 로 읽는다.
   * 다른 타입에서는 무시되지만 **보내지 않는다** — 계약이 무시한다고
   * 해서 뜻 없는 값을 실어 보낼 이유는 없다.
   */
  statsVariant?: ChatStatsVariant;
}

export interface ChatImagePresign {
  uploadUrl: string;
  imageUploadId: string;
}

/** 공지 변경 통지(/topic/chat/rooms/{id}/notice). 해제면 id 가 null. */
export interface ChatNoticeUpdate {
  noticeMessageId?: number | null;
  systemMessage?: ChatMessage | null;
}

/** 링크 프리뷰 지연 완성 통지(/topic/chat/rooms/{id}/updates). */
export interface ChatMessageUpdate {
  messageId: number;
  linkPreview?: ChatLinkPreview | null;
}

/** 구독이 거절됐을 때 개인 큐(/user/queue/chat-errors)로 오는 것. */
export interface ChatSocketError {
  code: string;
  message: string;
  /** 거절된 SUBSCRIBE destination(네이티브 헤더 x-failed-destination). */
  failedDestination?: string;
  retryAfterSeconds?: number;
}

/** 입력창을 열어도 되는가. 방과 내 멤버십이 모두 ACTIVE 여야 한다. */
export function canSendInRoom(room: Pick<
  ChatRoom,
  'status' | 'myMembershipStatus'
>): boolean {
  return room.status === 'ACTIVE' && room.myMembershipStatus === 'ACTIVE';
}

/** 공유 대상 상세 경로. 볼 수 없는 대상이면 null. */
export function chatSharePath(message: ChatMessage): string | null {
  const share = message.share;
  if (!share || !share.available) {
    return null;
  }
  return message.type === 'DIARY_SHARE'
    ? `/diary/${share.targetId}`
    : `/challenge/${share.targetId}`;
}
