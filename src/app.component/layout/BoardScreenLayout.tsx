import { Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import React from 'react';

interface BoardScreenLayoutProps {
  /** 데스크탑 헤더 타이틀 */
  title: string;
  /** 데스크탑 헤더 보조 설명 */
  description?: string;
  /** 데스크탑 헤더 우측 액션 */
  action?: React.ReactNode;
  /** 모바일 sticky 헤더 슬롯 (화면별로 상이) */
  mobileHeader?: React.ReactNode;
  /** 최상위 래퍼 className (기본값: min-h-screen w-full) */
  outerClassName?: string;
  children: React.ReactNode;
}

/**
 * 보드/리스트 화면의 공통 셸 — 최상위 래퍼 + 중앙 정렬 컨테이너 +
 * 데스크탑 헤더(타이틀/설명/액션)를 책임진다. 모바일 헤더와 본문은
 * 화면별로 상이하므로 슬롯/children 으로 주입한다.
 */
export function BoardScreenLayout({
  title,
  description,
  action,
  mobileHeader,
  outerClassName = 'min-h-screen w-full',
  children,
}: BoardScreenLayoutProps): React.ReactElement {
  return (
    <div className={outerClassName}>
      {mobileHeader}

      <div
        className={cn(
          'mx-auto w-full max-w-[1200px]',
          'px-5 py-5 lg:px-8 lg:py-10'
        )}
      >
        <header
          className={cn(
            'hidden flex-col gap-4 border-b border-gray-100 pb-5',
            'lg:flex lg:flex-row lg:items-end lg:justify-between'
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
          {action}
        </header>

        {children}
      </div>
    </div>
  );
}
