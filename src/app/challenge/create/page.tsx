'use client';

import ChallengeCreateScreen from '@feature/challenge/write/screen/challenge-create-screen';
import { authStorage } from '@module/utils/auth';
import { useRouter } from 'next/navigation';
import React, { useEffect, useSyncExternalStore } from 'react';

export default function ChallengeCreatePage(): React.ReactElement | null {
  const router = useRouter();
  const hasMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const isLoggedIn = hasMounted && authStorage.hasTokens();

  useEffect(() => {
    if (hasMounted && !authStorage.hasTokens()) {
      router.replace('/login');
    }
  }, [hasMounted, router]);

  if (!isLoggedIn) {
    return null;
  }

  return <ChallengeCreateScreen />;
}
