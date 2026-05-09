'use client';

import { BottomNav } from '@1d1s/design-system';
import { BookOpen, Home, LayoutGrid, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

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
}

export default function AppBottomNav({
  activeId,
}: AppBottomNavProps): React.ReactElement {
  const router = useRouter();
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
      className="sticky bottom-0 z-30"
    />
  );
}
