'use client';

import ChallengeCreateScreen from '@feature/challenge/write/screen/ChallengeCreateScreen';
import { useIsLoggedIn } from '@feature/member/hooks/useIsLoggedIn';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

export default function ChallengeCreatePage(): React.ReactElement | null {
  const router = useRouter();
  const isLoggedIn = useIsLoggedIn();

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/login');
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) {
    return null;
  }

  return <ChallengeCreateScreen />;
}
