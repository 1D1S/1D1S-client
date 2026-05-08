'use client';

import { useIsLoggedIn } from '@feature/member/hooks/useIsLoggedIn';
import { NotificationSettingsScreen } from '@feature/notification/screen/NotificationSettingsScreen';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

export default function NotificationSettingsPage(): React.ReactElement | null {
  const router = useRouter();
  const isLoggedIn = useIsLoggedIn();

  useEffect(() => {
    if (!isLoggedIn) { router.replace('/login'); }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) { return null; }

  return <NotificationSettingsScreen />;
}
