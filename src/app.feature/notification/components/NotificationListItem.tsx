'use client';

import { CircleAvatar, Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import { getRelativeTimeLabel } from '@module/utils/date';
import { useRouter } from 'next/navigation';

import { Notification } from '../type/notification';
import { FriendRequestNotificationActions } from './FriendRequestNotificationActions';

interface NotificationListItemProps {
  notification: Notification;
  onRead?(id: number): void;
}

function resolveTargetUrl(notification: Notification): string | null {
  // 친구 신청 알림은 받은 신청 페이지에서 처리하도록 친구 목록으로 보낸다.
  if (notification.type === 'FRIEND_REQUEST') {
    return '/mypage/friend';
  }
  const { targetType, targetId } = notification;
  if (!targetType || !targetId) { return null; }
  if (targetType.startsWith('MEMBER') || targetType.startsWith('FRIEND')) {
    return `/member/${targetId}`;
  }
  if (targetType.startsWith('DIARY')) { return `/diary/${targetId}`; }
  if (targetType.startsWith('CHALLENGE')) { return `/challenge/${targetId}`; }
  return null;
}

export function NotificationListItem({
  notification,
  onRead,
}: NotificationListItemProps): React.ReactElement {
  const router = useRouter();
  const {
    id,
    type,
    message,
    isRead,
    createdAt,
    actorId,
    actorProfileUrl,
  } = notification;

  const targetUrl = resolveTargetUrl(notification);
  const isFriendRequest = type === 'FRIEND_REQUEST' && actorId !== null;

  function handleActivate(): void {
    if (!isRead) { onRead?.(id); }
    if (targetUrl) { router.push(targetUrl); }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleActivate();
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleActivate}
      onKeyDown={handleKeyDown}
      className={cn(
        'flex w-full items-start gap-3 px-4 py-3.5 text-left',
        'transition-colors hover:bg-gray-50',
        'focus-visible:bg-gray-50 focus-visible:outline-none',
        !isRead && 'bg-main-200/40 hover:bg-main-200/60',
        !targetUrl && 'cursor-default',
      )}
    >
      <CircleAvatar imageUrl={actorProfileUrl ?? undefined} size="sm" />

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <Text
          size="body1"
          weight={isRead ? 'regular' : 'medium'}
          className={cn(isRead ? 'text-gray-700' : 'text-gray-900')}
        >
          {message}
        </Text>
        <Text size="caption2" weight="regular" className="text-gray-400">
          {getRelativeTimeLabel(createdAt)}
        </Text>
      </div>

      {isFriendRequest && actorId !== null ? (
        <FriendRequestNotificationActions
          actorId={actorId}
          notificationId={id}
          onMarkAsRead={onRead}
        />
      ) : null}

      {!isRead && !isFriendRequest && (
        <span className="bg-main-800 mt-1.5 h-2 w-2 shrink-0 rounded-full" />
      )}
    </div>
  );
}
