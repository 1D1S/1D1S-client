'use client';

import { BottomNav } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import { BookOpen, Home, LayoutGrid, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

interface BottomNavConfigItem {
  id: string;
  label: string;
  href: string;
  Icon: typeof Home;
}

const ITEMS: BottomNavConfigItem[] = [
  { id: 'home', label: '홈', href: '/', Icon: Home },
  { id: 'challenge', label: '챌린지', href: '/challenge', Icon: LayoutGrid },
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

  // 하단 탭 4개 경로를 마운트 시 prefetch — 모바일은 hover 가 없어
  // <Link> 자동 prefetch 가 트리거되지 않으므로 수동 워밍업이 필요하다.
  useEffect(() => {
    ITEMS.forEach((item) => {
      router.prefetch(item.href);
    });
  }, [router]);

  return (
    <BottomNav
      activeId={activeId}
      onChange={(id) => {
        const item = ITEMS.find((it) => it.id === id);
        if (item) {
          router.push(item.href);
        }
      }}
      items={ITEMS.map(({ id, label, Icon }) => ({
        id,
        label,
        icon: <Icon size={20} strokeWidth={1.8} />,
      }))}
      className={cn(
        'sticky bottom-0 z-30',
        'pb-[calc(0.875rem+env(safe-area-inset-bottom))]',
        className
      )}
    />
  );
}
