export type NotificationCategory = 'FRIEND' | 'DIARY' | 'CHALLENGE' | 'SYSTEM';

export type NotificationType =
  | 'FRIEND_REQUEST'
  | 'FRIEND_ACCEPT'
  | 'DIARY_POST'
  | 'DIARY_COMMENT'
  | 'COMMENT_REPLY'
  | 'LIKE_MILESTONE'
  | 'CHALLENGE_APPROVED'
  | 'CHALLENGE_REJECTED';

export type NotificationTargetType =
  | 'MEMBER'
  | 'DIARY'
  | 'DIARY_COMMENT'
  | 'CHALLENGE'
  | string;

export interface Notification {
  id: number;
  category: NotificationCategory;
  type: NotificationType;
  message: string;
  targetType: NotificationTargetType | null;
  targetId: number | null;
  isRead: boolean;
  groupedCount: number;
  actorId: number | null;
  actorNickname: string | null;
  actorProfileUrl: string | null;
  createdAt: string;
}

export interface NotificationPageInfo {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface NotificationListData {
  items: Notification[];
  pageInfo: NotificationPageInfo;
}

export interface NotificationListParams {
  page?: number;
  size?: number;
}

export interface NotificationPreferences {
  pushEnabled: boolean;
  friendEnabled: boolean;
  diaryEnabled: boolean;
  challengeEnabled: boolean;
  /**
   * 채팅 푸시 전체 스위치. 방별 pushEnabled 와 **다른 층**이라, 끄면 방별
   * 설정과 무관하게 아무 방도 푸시가 오지 않는다(서버가 AND 로 건다).
   */
  chatEnabled: boolean;
}

export interface UnreadCount {
  unreadCount: number;
}

/**
 * 엔티티 단위 읽음 처리 대상.
 *
 * 웹은 상세 화면 두 곳만 보낸다. 서버가 형제 타입(CHALLENGE_LIST,
 * DIARY_COMMENT 등)까지 알아서 확장 처리하므로 클라가 나열하지 않는다.
 */
export type NotificationReadTargetType = 'CHALLENGE_DETAIL' | 'DIARY_DETAIL';

export interface MarkTargetAsReadParams {
  targetType: NotificationReadTargetType;
  targetId: number;
}
