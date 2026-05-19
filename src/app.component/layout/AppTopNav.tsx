'use client';

import { Icon, StreakChip } from '@1d1s/design-system';
import { Skeleton } from '@component/Skeleton';
import { cn } from '@module/utils/cn';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const NAV_ITEMS = [
  { id: 'home', label: '홈', href: '/' },
  { id: 'challenge', label: '챌린지', href: '/challenge' },
  { id: 'diary', label: '일지', href: '/diary' },
  { id: 'mypage', label: '마이페이지', href: '/mypage' },
] as const;

interface AppTopNavProps {
  activeId: string;
  isLoggedIn: boolean;
  isAuthLoading?: boolean;
  hasUnread: boolean;
  streakDays: number;
  profileImageUrl?: string;
  onProfileClick(): void;
  className?: string;
}

export default function AppTopNav({
  activeId,
  isLoggedIn,
  isAuthLoading = false,
  hasUnread,
  streakDays,
  profileImageUrl,
  onProfileClick,
  className,
}: AppTopNavProps): React.ReactElement {
  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex shrink-0 items-center bg-white',
        'border-b border-gray-200',
        'h-14 gap-4 px-4 lg:h-[62px] lg:gap-7 lg:px-7',
        className
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
          className={cn(
            'text-[15px] font-extrabold tracking-tight text-gray-900'
          )}
        >
          1D1S
        </span>
      </Link>

      <nav className="flex items-center gap-1">
        {NAV_ITEMS.map((item) => {
          const active = activeId === item.id;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'rounded-2 transition',
                'px-2.5 py-1.5 lg:px-3.5 lg:py-2',
                'text-[13px] tracking-tight',
                active
                  ? 'bg-main-100 text-brand font-bold'
                  : 'font-medium text-gray-700 hover:bg-gray-100'
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="ml-auto flex items-center gap-2">
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

        {/*
          태블릿 이하에서만 로그인/아바타 클러스터 노출. 데스크탑은
          RightRail 이 인증 영역을 대신하므로 숨긴다.
        */}
        <div
          className={cn(
            'flex h-9 items-center gap-2 lg:hidden'
          )}
        >
          {isAuthLoading ? (
            <Skeleton
              shape="circle"
              className="h-9 w-9"
              aria-label="프로필 로딩 중"
            />
          ) : isLoggedIn ? (
            <>
              {streakDays > 0 ? (
                <StreakChip days={streakDays} unit="일" />
              ) : null}
              <button
                type="button"
                onClick={onProfileClick}
                aria-label="프로필"
                className={cn(
                  'h-9 w-9 overflow-hidden rounded-full',
                  'border-main-200 bg-main-100 border-2'
                )}
              >
                {profileImageUrl ? (
                  <Image
                    src={profileImageUrl}
                    alt="프로필"
                    width={36}
                    height={36}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className={cn(
                'rounded-2 bg-brand px-3.5 py-2',
                'text-[12px] font-bold text-white transition',
                'hover:brightness-105'
              )}
            >
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
