export type NotificationType =
  | 'FRIEND_REQUEST'
  | 'FRIEND_ACCEPT'
  | 'DIARY_POST'
  | 'DIARY_COMMENT'
  | 'COMMENT_REPLY'
  | 'LIKE_MILESTONE'
  | 'CHALLENGE_APPROVED'
  | 'CHALLENGE_REJECTED';

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl: string;
  sender: {
    id: number;
    nickname: string;
    profileImage: string | null;
  } | null;
}

export interface NotificationListResponse {
  items: Notification[];
  pageInfo: {
    limit: number;
    hasNextPage: boolean;
    nextCursor?: string;
  };
}

export interface NotificationListParams {
  size?: number;
  cursor?: string;
}