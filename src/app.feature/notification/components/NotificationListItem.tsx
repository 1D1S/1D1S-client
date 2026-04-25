'use client';

import { CircleAvatar, Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import { useRouter } from 'next/navigation';

import { Notification } from '../type/notification';

interface NotificationListItemProps {
  notification: Notification;
  onRead?(id: number): void;
}

function formatRelativeTime(createdAt: string): string {
  const diff = Date.now() - new Date(createdAt).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) { return '방금 전'; }
  if (minutes < 60) { return `${minutes}분 전`; }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) { return `${hours}시간 전`; }
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

export function NotificationListItem({
  notification,
  onRead,
}: NotificationListItemProps) {
  const router = useRouter();
  const { id, message, isRead, createdAt, actionUrl, sender } = notification;

  function handleClick() {
    if (!isRead) { onRead?.(id); }
    router.push(actionUrl);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'flex w-full items-start gap-3 px-4 py-3 text-left',
        'transition-colors hover:bg-gray-50',
        !isRead && 'bg-blue-50 hover:bg-blue-100'
      )}
    >
      <CircleAvatar imageUrl={sender?.profileImage ?? null} size="sm" />

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <Text size="body1" weight="regular" className="text-gray-900">
          {message}
        </Text>
        <Text size="caption2" weight="regular" className="text-gray-400">
          {formatRelativeTime(createdAt)}
        </Text>
      </div>

      {!isRead && (
        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
      )}
    </button>
  );
}
