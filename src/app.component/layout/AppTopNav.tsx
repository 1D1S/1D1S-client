'use client';

import { Icon, StreakChip } from '@1d1s/design-system';
import { ChallengeTrophyIcon } from '@component/ChallengeTrophyIcon';
import { ProfileAlertBadge } from '@component/ProfileAlertBadge';
import { Skeleton } from '@component/Skeleton';
import { cn } from '@module/utils/cn';
import {
  buildLoginUrl,
  loginUrlFromCurrentLocation,
} from '@module/utils/returnTo';
import { BookOpen, Compass, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';

// 아이콘은 모바일 하단 네비(AppBottomNav)와 동일한 세트로 통일한다.
// 챌린지는 EmptyState 일러스트에서 추출한 커스텀 트로피(ChallengeTrophyIcon).
const NAV_ITEMS: ReadonlyArray<{
  id: string;
  label: string;
  href: string;
  NavIcon?: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'home', label: '홈', href: '/' },
  { id: 'explore', label: '탐색', href: '/explore', NavIcon: Compass },
  {
    id: 'challenge',
    label: '챌린지',
    href: '/challenge',
    NavIcon: ChallengeTrophyIcon,
  },
  { id: 'diary', label: '일지', href: '/diary', NavIcon: BookOpen },
  { id: 'mypage', label: '마이페이지', href: '/mypage', NavIcon: User },
];

interface AppTopNavProps {
  activeId: string;
  isLoggedIn: boolean;
  isAuthLoading?: boolean;
  hasUnread: boolean;
  streakDays: number;
  profileImageUrl?: string;
  showPhoneBadge?: boolean;
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
  showPhoneBadge = false,
  onProfileClick,
  className,
}: AppTopNavProps): React.ReactElement {
  const router = useRouter();

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
          // 로그인 필요한 최상위 메뉴(마이페이지)는 비로그인에 그대로 노출하지
          // 않는다. 모바일 바텀 네비와 동일하게 '로그인'으로 바꾸고 로그인 후
          // 원래 목적지(마이페이지)로 복귀하는 동선으로 유도한다.
          const isGuestMyPage = item.id === 'mypage' && !isLoggedIn;
          const href = isGuestMyPage ? buildLoginUrl('/mypage') : item.href;
          const label = isGuestMyPage ? '로그인' : item.label;
          return (
            <Link
              key={item.id}
              href={href}
              className={cn(
                'rounded-2 inline-flex items-center gap-1.5 transition',
                'px-2.5 py-1.5 lg:px-3.5 lg:py-2',
                'text-[13px] tracking-tight',
                active
                  ? 'bg-main-100 text-brand font-bold'
                  : 'font-medium text-gray-700 hover:bg-gray-100'
              )}
            >
              {item.NavIcon ? (
                <item.NavIcon className="h-3.5 w-3.5" aria-hidden />
              ) : null}
              {label}
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
        <div className="flex h-9 items-center gap-2 lg:hidden">
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
              <span className="relative inline-flex">
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
                {showPhoneBadge ? <ProfileAlertBadge /> : null}
              </span>
            </>
          ) : (
            <Link
              href="/login"
              onClick={(event) => {
                // 새 탭 열기(수정자 키 클릭)는 기본 동작 유지
                if (
                  event.metaKey ||
                  event.ctrlKey ||
                  event.shiftKey ||
                  event.altKey
                ) {
                  return;
                }
                event.preventDefault();
                // 로그인 후 보던 페이지로 복귀할 수 있게 returnTo 를 싣는다
                router.push(loginUrlFromCurrentLocation());
              }}
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
