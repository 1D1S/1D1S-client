'use client';

import { Button, Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import { Trophy } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import {
  dismissOfficialGuideBanner,
  isOfficialGuideBannerDismissed,
} from '../utils/officialGuideBannerDismissal';

/**
 * 공식 챌린지 상세 상단 안내 배너.
 * 공식 챌린지가 처음인 사용자를 가이드 페이지로 유도한다. "다시 보지 않기"를
 * 누르면 장기 쿠키에 기록해 이후 모든 공식 챌린지 상세에서 노출되지 않는다.
 *
 * dismiss 상태는 lazy initializer 로 첫 렌더에 확정한다. 이 배너는 클라이언트
 * 전용(상세 화면은 로딩 스켈레톤을 SSR)이라 마운트 후에야 렌더되므로,
 * 하이드레이션 불일치 없이 첫 페인트부터 올바른 상태로 나타난다. 차단됐거나
 * 닫힌 뒤에는 null 을 반환해 레이아웃 공간을 차지하지 않는다.
 */
export function OfficialChallengeGuideBanner(): React.ReactElement | null {
  const router = useRouter();
  const [visible, setVisible] = useState(
    () => !isOfficialGuideBannerDismissed()
  );

  if (!visible) {
    return null;
  }

  const handleDismiss = (): void => {
    dismissOfficialGuideBanner();
    setVisible(false);
  };

  return (
    <div
      className={cn(
        'border-main-300 bg-main-100 flex items-center gap-3.5 rounded-[14px]',
        'border px-4 py-3.5 sm:px-5'
      )}
    >
      <span
        className={cn(
          'bg-main-800 flex h-10 w-10 shrink-0 items-center justify-center',
          'rounded-[12px] shadow-[0_4px_12px_rgba(255,89,0,0.24)]'
        )}
      >
        <Trophy className="h-5 w-5 text-white" strokeWidth={2} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <Text
          size="body2"
          weight="extrabold"
          className="block text-gray-900"
        >
          공식 챌린지가 처음이라면?
        </Text>
        <Text
          size="caption1"
          weight="regular"
          className="mt-0.5 block break-keep text-gray-600"
        >
          순위 산정 방식과 보상을 먼저 확인해보세요.
        </Text>
        <div className="mt-2.5 flex items-center gap-2">
          <Button
            size="sm"
            variant="primary"
            onClick={() => router.push('/guide/official')}
          >
            확인하러 가기
          </Button>
          <Button size="sm" variant="secondary" onClick={handleDismiss}>
            다시 보지 않기
          </Button>
        </div>
      </div>
    </div>
  );
}
