'use client';

import { Icon } from '@1d1s/design-system';
import { useIsLoggedIn } from '@feature/member/hooks/useIsLoggedIn';
import { cn } from '@module/utils/cn';
import Link from 'next/link';
import React from 'react';

import { useUnreadCount } from '../hooks/useNotificationQueries';

/**
 * 헤더의 알림 진입 버튼. 안 읽은 알림이 있으면 점을 얹는다.
 *
 * **비로그인이면 아무것도 그리지 않는다.** 알림함은 로그인해야 열리는
 * 화면이라, 게스트에게 보이면 눌러도 로그인으로 튕기는 미끼가 된다.
 * 게스트 헤더에는 로그인 진입만 남는다.
 *
 * 숨김 판정을 이 안에 둔 것은 헤더가 둘(데스크탑 AppTopNav · 모바일
 * HomeMobileHeader)이라서다 — 부르는 쪽에 조건을 두면 한쪽만 고쳐진다.
 * 채팅 진입(ChatEntryButton)과 같은 방식이다.
 */
export function NotificationBellButton({
  className,
}: {
  className?: string;
}): React.ReactElement | null {
  const isLoggedIn = useIsLoggedIn();
  const { data } = useUnreadCount({ enabled: isLoggedIn });

  if (!isLoggedIn) {
    return null;
  }

  const hasUnread = (data?.unreadCount ?? 0) > 0;

  return (
    <Link
      href="/notification"
      aria-label={hasUnread ? '알림 (안 읽음 있음)' : '알림'}
      className={cn(
        'relative flex h-9 w-9 items-center justify-center',
        'rounded-2 bg-gray-100 text-gray-700 transition hover:bg-gray-200',
        className
      )}
    >
      <Icon name="Bell" size={16} />
      {hasUnread ? (
        <span
          aria-hidden
          className={cn(
            'absolute top-2 right-2 h-1.5 w-1.5',
            'bg-brand rounded-full'
          )}
        />
      ) : null}
    </Link>
  );
}
