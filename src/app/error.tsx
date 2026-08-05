'use client';

import { Button, Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import React, { useEffect } from 'react';

/**
 * 라우트 세그먼트 에러 바운더리.
 *
 * 이전에는 렌더 중 예외·RSC 예외가 Next 기본 "Application error" 흰 화면으로
 * 떨어졌다 — 앱(웹뷰)에서는 그게 그대로 "앱이 깨졌다"로 보인다. 사용자에게
 * 복구 버튼을 주고, 원인은 콘솔로 남긴다.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset(): void;
}): React.ReactElement {
  useEffect(() => {
    // 서버 메시지를 사용자에게 노출하지 않는다 — 진단은 콘솔/모니터링으로.
    console.error('[error-boundary]', error);
  }, [error]);

  return (
    <div
      className={cn(
        'flex min-h-screen flex-col items-center justify-center',
        'gap-6 bg-white p-8 text-center'
      )}
    >
      <div className="flex flex-col gap-2">
        <Text size="display2" weight="bold" className="text-gray-900">
          일시적인 오류가 발생했습니다
        </Text>
        <Text size="body1" weight="regular" className="text-gray-500">
          잠시 후 다시 시도해 주세요.
        </Text>
      </div>
      <div className="flex gap-3">
        <Button variant="ghost" size="md" onClick={() => reset()}>
          다시 시도
        </Button>
        <Button size="md" onClick={() => window.location.replace('/')}>
          홈으로 이동
        </Button>
      </div>
    </div>
  );
}
