'use client';

import { Text } from '@1d1s/design-system';
import { Bell, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function NotificationPage(): React.ReactElement {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full bg-white p-4">
      <div className="mx-auto w-full max-w-[600px]">
        <div className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm font-medium text-gray-500 transition hover:text-gray-700"
          >
            <ChevronLeft className="h-4 w-4" />
            돌아가기
          </button>
        </div>

        <Text size="display1" weight="bold" className="mb-8 text-gray-900">
          알림
        </Text>

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
      </div>
    </div>
  );
}
