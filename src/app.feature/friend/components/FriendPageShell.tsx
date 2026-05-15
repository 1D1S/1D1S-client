'use client';

import { Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

interface FriendPageShellProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

/**
 * 친구 관련 페이지의 공통 레이아웃.
 *
 * - 모바일: 컨테이너 위쪽에 sticky `← + 타이틀`
 * - 데스크탑: 중앙 정렬 컨테이너 내부에 큰 타이틀 + 설명을 노출
 *
 * 헤더와 컨텐츠가 동일한 max-width / padding 안에 들어가야 정렬이 맞으므로
 * 헤더와 컨테이너를 함께 책임진다.
 */
export function FriendPageShell({
  title,
  description,
  children,
}: FriendPageShellProps): React.ReactElement {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full">
      <div
        className={cn(
          'sticky top-0 z-30 flex h-14 items-center gap-3',
          'border-b border-gray-100 bg-white/95 px-4 backdrop-blur',
          'lg:hidden',
        )}
      >
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => router.back()}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg',
            'text-gray-700 transition-colors hover:bg-gray-100',
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
      </div>

      <div
        className={cn(
          'mx-auto w-full lg:max-w-[760px]',
          'px-0 py-0 lg:px-8 lg:py-10',
        )}
      >
        <header
          className={cn(
            'hidden flex-col gap-1.5 border-b border-gray-100 pb-5',
            'lg:flex',
          )}
        >
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
        </header>

        {children}
      </div>
    </div>
  );
}
