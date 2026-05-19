'use client';

import { Icon } from '@1d1s/design-system';
import { useIsLoggedIn } from '@feature/member/hooks/useIsLoggedIn';
import { useUnreadCount } from '@feature/notification/hooks/useNotificationQueries';
import { cn } from '@module/utils/cn';
import Link from 'next/link';
import React from 'react';

export default function HomeMobileHeader(): React.ReactElement {
  const isLoggedIn = useIsLoggedIn();
  const { data: unreadData } = useUnreadCount({ enabled: isLoggedIn });
  const hasUnread = isLoggedIn && (unreadData?.unreadCount ?? 0) > 0;

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between',
        'border-b border-gray-200 bg-white px-4 lg:hidden'
      )}
    >
      <Link href="/" className="flex shrink-0 items-center gap-2.5">
        <span
          className={cn(
            'rounded-2 flex h-7 w-7 items-center justify-center',
            'from-main-700 to-main-800 bg-gradient-to-br',
            'shadow-warm text-white'
          )}
        >
          <Icon name="Logo" size={16} className="text-white" />
        </span>
        <span
          className="text-[15px] font-extrabold tracking-tight text-gray-900"
        >
          1D1S
        </span>
      </Link>

      <Link
        href="/notification"
        aria-label="알림"
        className={cn(
          'relative flex h-9 w-9 items-center justify-center',
          'rounded-2 bg-gray-100 text-gray-700',
          'transition hover:bg-gray-200'
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
    </header>
  );
}
