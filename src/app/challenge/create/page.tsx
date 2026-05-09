'use client';

import ChallengeCreateScreen from '@feature/challenge/write/screen/ChallengeCreateScreen';
import { useIsLoggedIn } from '@feature/member/hooks/useIsLoggedIn';
import { useRouter } from 'next/navigation';
import React, { useEffect, useSyncExternalStore } from 'react';

const NOOP_SUBSCRIBE = (): (() => void) => () => {};

export default function ChallengeCreatePage(): React.ReactElement | null {
  const router = useRouter();
  // 하이드레이션 직후 useIsLoggedIn 이 일시적으로 false 인 구간에 useEffect 가
  // /login 으로 라우팅하는 것을 막기 위한 hasMounted 가드.
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

  return <ChallengeCreateScreen />;
}
