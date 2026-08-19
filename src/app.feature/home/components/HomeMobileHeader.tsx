'use client';

import { Icon } from '@1d1s/design-system';
import { ChatEntryButton } from '@feature/chat/components/ChatEntryButton';
import { NotificationBellButton } from '@feature/notification/components/NotificationBellButton';
import { cn } from '@module/utils/cn';
import Link from 'next/link';
import React from 'react';

export default function HomeMobileHeader(): React.ReactElement {
  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex shrink-0 items-center justify-between',
        'h-14-safe pt-safe-top',
        // px-5 로 탐색·챌린지·일지 모바일 헤더와 좌우 패딩을 통일한다.
        'border-b border-gray-200 bg-white px-5 lg:hidden'
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
        <span className="text-[15px] font-extrabold tracking-tight text-gray-900">
          1D1S
        </span>
      </Link>

      <div className="flex items-center gap-2">
        <ChatEntryButton />
        <NotificationBellButton />
      </div>
    </header>
  );
}
