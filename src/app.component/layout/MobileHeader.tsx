'use client';

import { Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

interface MobileHeaderProps {
  /** 헤더 타이틀 */
  title: string;
  /** 뒤로가기 동작 (기본값: router.back) */
  onBack?(): void;
  /** 타이틀 우측 액션 슬롯 */
  right?: React.ReactNode;
  /** 타이틀 아래 보조 문구 — 태블릿(sm) 이상에서만 노출 */
  subtitle?: React.ReactNode;
  /** 추가 클래스 (레이아웃 미세 조정용) */
  className?: string;
}

/**
 * 모바일 전용 sticky 상단 헤더 — `← + 타이틀 (+ 우측 액션)`.
 *
 * 서브/리스트/상세/작성 화면 전반에서 제각각 인라인으로 반복되던 뒤로가기
 * sticky 헤더를 단일 규격으로 통합한 컴포넌트. 타이틀은 DS `Text` `body1`
 * (text-xl) / `extrabold` 로 고정하고, safe-area(pt-safe-top)까지 책임진다.
 *
 * NOTE: 이 클라이언트는 디자인시스템을 외부 published 패키지
 * `@1d1s/design-system` 로 소비하므로, 동일 규격을 DS 레포에 반영하려면
 * 별도 퍼블리시 작업이 필요하다. 우선 클라 공용 레이어에서 통일한다.
 */
export function MobileHeader({
  title,
  onBack,
  right,
  subtitle,
  className,
}: MobileHeaderProps): React.ReactElement {
  const router = useRouter();
  const handleBack = onBack ?? ((): void => router.back());

  return (
    <div
      className={cn(
        'sticky top-0 z-30 flex items-center gap-3',
        'h-14-safe pt-safe-top',
        'border-b border-gray-100 bg-white/95 px-4 backdrop-blur',
        'lg:hidden',
        className
      )}
    >
      <button
        type="button"
        aria-label="뒤로가기"
        onClick={handleBack}
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-lg',
          'text-gray-700 transition-colors hover:bg-gray-100'
        )}
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      {subtitle ? (
        <div className="min-w-0 flex-1">
          <Text
            size="body1"
            weight="extrabold"
            className="block truncate tracking-[-0.3px] text-gray-900"
          >
            {title}
          </Text>
          <Text
            size="caption2"
            weight="regular"
            className="hidden truncate text-gray-500 sm:block"
          >
            {subtitle}
          </Text>
        </div>
      ) : (
        <Text
          size="body1"
          weight="extrabold"
          className="flex-1 truncate tracking-[-0.3px] text-gray-900"
        >
          {title}
        </Text>
      )}
      {right}
    </div>
  );
}
