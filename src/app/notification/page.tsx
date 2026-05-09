'use client';

import { useIsLoggedIn } from '@feature/member/hooks/useIsLoggedIn';
import { NotificationScreen } from '@feature/notification/screen/NotificationScreen';
import { useRouter } from 'next/navigation';
import React, { useEffect, useSyncExternalStore } from 'react';

const NOOP_SUBSCRIBE = (): (() => void) => () => {};

export default function NotificationPage(): React.ReactElement | null {
  const router = useRouter();
  // hydration 직후 useSyncExternalStore가 서버 snapshot(false)으로 한 번 렌더링되면서
  // useIsLoggedIn이 일시적으로 false가 되는 구간이 있다. 이 시점에 useEffect가
  // 실행되어 /login 으로 라우팅되는 것을 막기 위해 hasMounted 가드를 둔다.
  const hasMounted = useSyncExternalStore(
    NOOP_SUBSCRIBE,
    () => true,
    () => false,
  );
  const isLoggedIn = useIsLoggedIn();

  useEffect(() => {
    if (hasMounted && !isLoggedIn) {
      router.replace('/login');
    }
  }, [hasMounted, isLoggedIn, router]);

  if (!isLoggedIn) {
    return null;
  }

  return <NotificationScreen />;
}
