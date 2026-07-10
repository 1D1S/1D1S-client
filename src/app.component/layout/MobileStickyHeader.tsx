'use client';

import { Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

interface MobileStickyHeaderProps {
  /** 헤더 타이틀 */
  title: string;
  /** 뒤로가기 동작 (기본값: router.back) */
  onBack?(): void;
  /** 타이틀 Text size (기본값: heading2) */
  titleSize?: React.ComponentProps<typeof Text>['size'];
  /** 타이틀 우측 액션 슬롯 */
  right?: React.ReactNode;
}

/**
 * 모바일 전용 sticky 상단 헤더 — `← + 타이틀 (+ 우측 액션)`.
 *
 * 서브/리스트 페이지 20여 곳에서 반복되던 뒤로가기 sticky 헤더를
 * 단일 컴포넌트로 공통화한 것. safe-area(pt-safe-top)까지 책임진다.
 */
export function MobileStickyHeader({
  title,
  onBack,
  titleSize = 'heading2',
  right,
}: MobileStickyHeaderProps): React.ReactElement {
  const router = useRouter();
  const handleBack = onBack ?? ((): void => router.back());

  return (
    <div
      className={cn(
        'sticky top-0 z-30 flex items-center gap-3',
        'h-14-safe pt-safe-top',
        'border-b border-gray-100 bg-white/95 px-4 backdrop-blur',
        'lg:hidden'
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
      <Text
        size={titleSize}
        weight="extrabold"
        className="flex-1 tracking-[-0.3px] text-gray-900"
      >
        {title}
      </Text>
      {right}
    </div>
  );
}
