'use client';

import { BottomNav } from '@1d1s/design-system';
import { ChallengeTrophyIcon } from '@component/ChallengeTrophyIcon';
import { useSidebar } from '@feature/member/hooks/useMemberQueries';
import { useAuthStatus } from '@module/hooks/useAuthStatus';
import { cn } from '@module/utils/cn';
import { resolveDiaryImageUrl } from '@module/utils/diaryImageUrl';
import { buildLoginUrl } from '@module/utils/returnTo';
import { BookOpen, Compass, Home, User } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useTransition } from 'react';

interface BottomNavConfigItem {
  id: string;
  label: string;
  href: string;
  Icon: React.ComponentType<{
    className?: string;
    size?: number | string;
    strokeWidth?: number | string;
  }>;
}

const ITEMS: BottomNavConfigItem[] = [
  { id: 'home', label: '홈', href: '/', Icon: Home },
  { id: 'explore', label: '탐색', href: '/explore', Icon: Compass },
  {
    id: 'challenge',
    label: '챌린지',
    href: '/challenge',
    Icon: ChallengeTrophyIcon,
  },
  { id: 'diary', label: '일지', href: '/diary', Icon: BookOpen },
  { id: 'mypage', label: '마이', href: '/mypage', Icon: User },
];

interface AppBottomNavProps {
  activeId: string;
  className?: string;
}

export default function AppBottomNav({
  activeId,
  className,
}: AppBottomNavProps): React.ReactElement {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  // 확정된 게스트만 "로그인" 탭을 노출한다. 부팅 세션 확인 중(unknown)에는
  // 프로필 자리를 유지해, Safari PWA 첫 진입에서 마이 탭이 "로그인"으로
  // 번쩍였다 프로필로 바뀌는 깜빡임을 없앤다.
  const isGuest = useAuthStatus() === 'guest';
  const { data: sidebar } = useSidebar();
  const profileImageUrl = resolveDiaryImageUrl(sidebar?.profileUrl ?? null);

  // 하단 탭 4개 경로를 마운트 시 단 한 번만 prefetch — 모바일은 hover 가 없어
  // <Link> 자동 prefetch 가 트리거되지 않으므로 수동 워밍업이 필요하다.
  // 비로그인 시 마이 탭이 /login 으로 이동하므로 /login 도 함께 워밍업한다.
  useEffect(() => {
    ITEMS.forEach((item) => {
      router.prefetch(item.href);
    });
    if (isGuest) {
      router.prefetch('/login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGuest]);

  const handleChange = useCallback(
    (id: string): void => {
      // 비로그인 마이 탭: 로그인 후 원래 목적지(마이페이지)로 복귀
      const target =
        id === 'mypage' && isGuest
          ? buildLoginUrl('/mypage')
          : ITEMS.find((it) => it.id === id)?.href;
      if (!target) {
        return;
      }
      // useTransition 으로 라우트 전환을 감싸면 React 가 즉시 isPending=true 로
      // 표시해 "안 눌렸나?" 라는 사용자 체감을 줄인다.
      startTransition(() => {
        router.push(target);
      });
    },
    [router, isGuest]
  );

  const navItems = useMemo(
    () =>
      ITEMS.map(({ id, label, Icon }) => {
        if (id === 'mypage') {
          if (isGuest) {
            return {
              id,
              label: '로그인',
              icon: <Icon size={20} strokeWidth={1.8} />,
            };
          }
          return {
            id,
            label,
            icon: (
              <span
                className={cn(
                  'relative block h-5 w-5 overflow-hidden rounded-full',
                  'border border-gray-200 bg-gray-100'
                )}
                aria-hidden
              >
                {profileImageUrl ? (
                  <Image
                    src={profileImageUrl}
                    alt=""
                    fill
                    sizes="20px"
                    className="object-cover"
                  />
                ) : null}
              </span>
            ),
          };
        }
        return {
          id,
          label,
          icon: <Icon size={20} strokeWidth={1.8} />,
        };
      }),
    [isGuest, profileImageUrl]
  );

  return (
    <BottomNav
      activeId={activeId}
      onChange={handleChange}
      items={navItems}
      className={cn(
        'sticky bottom-0 z-30',
        'pb-[calc(0.875rem+env(safe-area-inset-bottom))]',
        // 라우트 전환 중에는 약하게 페이드해 클릭이 즉시 인식됨을 표시.
        isPending && 'opacity-90',
        className
      )}
    />
  );
}
