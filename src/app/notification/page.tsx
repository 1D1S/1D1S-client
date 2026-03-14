'use client';

import { Text } from '@1d1s/design-system';
import { authStorage } from '@module/utils/auth';
import { Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useSyncExternalStore } from 'react';

export default function NotificationPage(): React.ReactElement | null {
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

  return (
    <div className="flex min-h-screen w-full flex-col bg-white p-4">
      <section className="rounded-3 w-full bg-white p-2">
        <div className="flex items-start justify-between border-b border-gray-200 pb-5">
          <Text size="display1" weight="bold" className="text-gray-900">
            알림
          </Text>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <Bell className="h-8 w-8 text-gray-400" />
          </div>
          <Text size="heading1" weight="bold" className="text-gray-700">
            추후 개발될 기능입니다
          </Text>
          <Text size="body1" weight="regular" className="text-gray-400">
            알림 기능은 곧 업데이트될 예정입니다.
          </Text>
        </div>
      </section>
    </div>
  );
}
