'use client';

import { Button, Text } from '@1d1s/design-system';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function NotFound(): React.ReactElement {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white p-8 text-center">
      <Text size="display1" weight="bold" className="text-main-800">
        404
      </Text>
      <div className="flex flex-col gap-2">
        <Text size="display2" weight="bold" className="text-gray-900">
          페이지를 찾을 수 없습니다
        </Text>
        <Text size="body1" weight="regular" className="text-gray-500">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </Text>
      </div>
      <div className="flex gap-3">
        <Button variant="ghost" size="medium" onClick={() => router.back()}>
          이전 페이지
        </Button>
        <Button size="medium" onClick={() => router.push('/')}>
          홈으로 이동
        </Button>
      </div>
    </div>
  );
}
