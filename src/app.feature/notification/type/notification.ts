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
}

export interface NotificationEndpoint {
  id: number;
  endpointUrl: string;
  isActive: boolean;
  lastSeenAt: string;
}

export interface WebPushEndpointRequest {
  endpointUrl: string;
  p256dh: string;
  authSecret: string;
}

export interface UnreadCount {
  unreadCount: number;
}
