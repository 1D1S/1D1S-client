'use client';

import { useIsLoggedIn } from '@feature/member/hooks/useIsLoggedIn';
import { useNativeCapability } from '@module/hooks/useNativeCapability';
import { cn } from '@module/utils/cn';
import { isNativeChatAvailable } from '@module/utils/nativeBridge';
import { MessageCircle } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { useChatUnreadTotal } from '../hooks/useChatQueries';

/**
 * 헤더의 채팅 진입 버튼. 방 전체 안 읽음 합을 배지로 얹는다.
 *
 * 네이티브 쉘이 자기 채팅을 갖고 있으면 아무것도 그리지 않는다 — 같은
 * 기능이 두 벌 보이지 않게.
 */
export function ChatEntryButton({
  className,
}: {
  className?: string;
}): React.ReactElement | null {
  const isLoggedIn = useIsLoggedIn();
  const nativeChat = useNativeCapability(isNativeChatAvailable);
  const unread = useChatUnreadTotal({ enabled: isLoggedIn && !nativeChat });

  if (!isLoggedIn || nativeChat) {
    return null;
  }

  return (
    <Link
      href="/chat"
      aria-label={unread > 0 ? `채팅 (안 읽음 ${unread}건)` : '채팅'}
      className={cn(
        'relative flex h-9 w-9 items-center justify-center',
        'rounded-2 bg-gray-100 text-gray-700 transition hover:bg-gray-200',
        className
      )}
    >
      <MessageCircle className="h-4 w-4" />
      {unread > 0 ? (
        <span
          className={cn(
            'bg-main-600 absolute -top-1 -right-1 inline-flex min-w-4',
            'items-center justify-center rounded-full px-1',
            'text-[10px] leading-4 font-extrabold text-white'
          )}
        >
          {unread > 99 ? '99+' : unread}
        </span>
      ) : null}
    </Link>
  );
}
