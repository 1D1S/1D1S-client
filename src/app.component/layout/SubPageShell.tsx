'use client';

import { Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

interface SubPageShellProps {
  /** 페이지 타이틀 (모바일 헤더 / 데스크탑 헤더 공통) */
  title: string;
  /** 데스크탑 헤더에 노출할 보조 설명 */
  description?: string;
  /** 헤더 우측 액션 (모바일·데스크탑 헤더 양쪽에 노출) */
  headerAction?: React.ReactNode;
  /** 뒤로가기 동작 (기본값: router.back) */
  onBack?(): void;
  children: React.ReactNode;
}

/**
 * 설정 / 친구 / 알림 등 마이페이지 계열 서브 페이지의 공통 레이아웃.
 *
 * - 모바일: 상단 sticky `← + 타이틀 (+ 액션)` 헤더 + safe-area 대응
 * - 데스크탑: 중앙 정렬 컨테이너 내부에 큰 타이틀 + 설명 (+ 액션)
 *
 * 헤더와 컨텐츠가 동일한 max-width / padding 안에 정렬되도록
 * 헤더와 컨테이너를 함께 책임진다.
 */
export function SubPageShell({
  title,
  description,
  headerAction,
  onBack,
  children,
}: SubPageShellProps): React.ReactElement {
  const router = useRouter();
  const handleBack = onBack ?? ((): void => router.back());

  return (
    <div className="min-h-screen w-full">
      {/* 모바일 sticky 헤더 */}
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
          size="body1"
          weight="extrabold"
          className="flex-1 tracking-[-0.3px] text-gray-900"
        >
          {title}
        </Text>
        {headerAction}
      </div>

      <section className="mx-auto w-full max-w-[980px] p-4 lg:p-6">
        {/* 데스크탑 헤더 */}
        <header
          className={cn(
            'hidden items-end justify-between gap-4 lg:flex',
            'border-b border-gray-200 pb-5'
          )}
        >
          <div className="flex flex-col gap-1.5">
            <Text
              size="pageTitle"
              weight="extrabold"
              className="tracking-tight text-gray-900"
            >
              {title}
            </Text>
            {description ? (
              <Text size="body2" weight="regular" className="text-gray-500">
                {description}
              </Text>
            ) : null}
          </div>
          {headerAction ? <div className="shrink-0">{headerAction}</div> : null}
        </header>

        <div className="mt-6">{children}</div>
      </section>
    </div>
  );
}
