'use client';

import { BottomNav } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import { BookOpen, Home, LayoutGrid, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useTransition } from 'react';

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

// 매 렌더마다 같은 아이콘을 새로 만들지 않도록 모듈 상수로 고정한다.
// 디자인시스템 BottomNav 가 items prop 의 참조 동등성을 활용해 메모이즈할 수
// 있도록 한 번만 생성한다.
const NAV_ITEMS = ITEMS.map(({ id, label, Icon }) => ({
  id,
  label,
  icon: <Icon size={20} strokeWidth={1.8} />,
}));

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

  // 하단 탭 4개 경로를 마운트 시 단 한 번만 prefetch — 모바일은 hover 가 없어
  // <Link> 자동 prefetch 가 트리거되지 않으므로 수동 워밍업이 필요하다.
  // router 의존성은 의도적으로 제외 — router identity 가 바뀌어도 prefetch 는
  // 마운트 한 번이면 충분하다.
  useEffect(() => {
    ITEMS.forEach((item) => {
      router.prefetch(item.href);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = useCallback(
    (id: string): void => {
      const item = ITEMS.find((it) => it.id === id);
      if (!item) {
        return;
      }
      // useTransition 으로 라우트 전환을 감싸면 React 가 즉시 isPending=true 로
      // 표시해 "안 눌렸나?" 라는 사용자 체감을 줄인다.
      startTransition(() => {
        router.push(item.href);
      });
    },
    [router]
  );

  const navItems = useMemo(
    () =>
      NAV_ITEMS.map((it) => ({
        ...it,
        // 전환 중인 탭에 미세한 시각적 피드백을 위해 활성 표시를 즉시 반영.
      })),
    []
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
