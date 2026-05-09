'use client';

import { Icon, StreakChip } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

const NAV_ITEMS = [
  { id: 'home', label: '홈', href: '/' },
  { id: 'challenge', label: '챌린지', href: '/challenge' },
  { id: 'diary', label: '일지', href: '/diary' },
  { id: 'mypage', label: '마이페이지', href: '/mypage' },
] as const;

type TopNavMode = 'desktop' | 'tablet' | 'mobile';

interface AppTopNavProps {
  activeId: string;
  isLoggedIn: boolean;
  mode: TopNavMode;
  hasUnread: boolean;
  streakDays: number;
  profileImageUrl?: string;
  onProfileClick(): void;
}

export default function AppTopNav({
  activeId,
  isLoggedIn,
  mode,
  hasUnread,
  streakDays,
  profileImageUrl,
  onProfileClick,
}: AppTopNavProps): React.ReactElement {
  const isCompact = mode !== 'desktop';
  const showNav = mode !== 'mobile';
  const showSearchInput = mode === 'desktop';
  const showSearchButton = mode === 'tablet';
  const showStreakAndAvatar = mode !== 'desktop';
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');

  const submitSearch = (): void => {
    const trimmed = searchValue.trim();
    if (!trimmed) {
      return;
    }
    router.push(`/challenge?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex shrink-0 items-center bg-white',
        'border-b border-gray-200',
        isCompact ? 'h-14 gap-4 px-4' : 'h-[62px] gap-7 px-7'
      )}
    >
      <Link href="/" className="flex shrink-0 items-center gap-2.5">
        <span
          className={cn(
            'rounded-2 flex h-7 w-7 items-center justify-center',
            'from-main-700 to-main-800 bg-gradient-to-br',
            'text-[12px] font-extrabold text-white',
            'shadow-warm'
          )}
        >
          1D
        </span>
        <span
          className={cn(
            'text-[15px] font-extrabold tracking-tight text-gray-900'
          )}
        >
          1Day 1Streak
        </span>
      </Link>

      <nav
        className={cn('flex items-center gap-1', !showNav && 'hidden')}
      >
        {NAV_ITEMS.map((item) => {
          const active = activeId === item.id;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'rounded-2 transition',
                isCompact ? 'px-2.5 py-1.5' : 'px-3.5 py-2',
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
        {showSearchButton ? (
          <button
            type="button"
            aria-label="검색"
            onClick={() => router.push('/challenge')}
            className={cn(
              'flex h-9 w-9 items-center justify-center',
              'rounded-2 bg-gray-100 text-gray-700',
              'transition hover:bg-gray-200'
            )}
          >
            <Icon name="Search" size={16} />
          </button>
        ) : null}
        {showSearchInput ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              submitSearch();
            }}
            className="relative w-[260px]"
          >
            <span
              aria-hidden
              className={cn(
                'pointer-events-none absolute top-1/2 left-3',
                '-translate-y-1/2 text-gray-400'
              )}
            >
              <Icon name="Search" size={14} />
            </span>
            <input
              type="search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="챌린지·일지 검색"
              className={cn(
                'rounded-2 w-full border border-gray-200 bg-gray-50',
                'py-2 pr-3 pl-9 text-[12px] text-gray-800',
                'outline-none placeholder:text-gray-400',
                'focus:border-main-300 transition focus:bg-white'
              )}
            />
          </form>
        ) : null}

        <button
          type="button"
          aria-label="알림"
          onClick={() => router.push('/notification')}
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
        </button>

        {showStreakAndAvatar && isLoggedIn ? (
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
        ) : null}

        {!isLoggedIn ? (
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
        ) : null}
      </div>
    </header>
  );
}
