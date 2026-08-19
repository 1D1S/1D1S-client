// 그룹 챌린지 채팅 계약. 앱(_1d1s_app/lib/features/chat/data/chat_api.dart)과
// 같은 서버 DTO 를 본다 — 이름/옵셔널 여부를 앱 쪽과 어긋나게 두지 않는다.

export const CHAT_MESSAGE_TYPES = [
  'TEXT',
  'IMAGE',
  'CHALLENGE_SHARE',
  'DIARY_SHARE',
  // 공지 설정/해제 안내. 클라가 보내면 서버가 CHAT-005 로 막는다.
  'SYSTEM',
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
