'use client';

import { useIsLoggedIn } from '@feature/member/hooks/useIsLoggedIn';
import { NotificationScreen } from '@feature/notification/screen/NotificationScreen';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

export default function NotificationPage(): React.ReactElement | null {
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

  return <NotificationScreen />;
}
