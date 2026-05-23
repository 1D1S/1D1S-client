import { Skeleton } from '@component/Skeleton';
import { DiaryCardSkeletonGrid } from '@component/skeletons/DiaryCardSkeleton';
import { cn } from '@module/utils/cn';
import React from 'react';

/**
 * 일지 보드 페이지 진입 시 Suspense fallback 으로 사용.
 *
 * 헤더 같이 데이터가 필요 없는 정적 요소는 그대로 노출하고,
 * 카드 영역만 스켈레톤으로 채워 페이지 진입 시 레이아웃 시프트를 최소화한다.
 */
export function DiaryBoardSkeleton(): React.ReactElement {
  return (
    <div className="min-h-screen w-full">
      {/* 모바일 sticky 헤더 */}
      <div
        className={cn(
          'sticky top-0 z-20 flex items-center justify-between',
          'gap-3 border-b border-gray-100',
          'bg-white/95 px-5 pt-[calc(0.875rem+env(safe-area-inset-top))] pb-3',
          'backdrop-blur lg:hidden'
        )}
      >
        <h1
          className={cn(
            'text-3xl font-extrabold tracking-[-0.5px] text-gray-900'
          )}
        >
          일지
        </h1>
        <Skeleton shape="pill" className="h-8 w-18 shrink-0" />
      </div>

      <div
        className={cn(
          'mx-auto w-full max-w-[1200px]',
          'px-5 py-5 lg:px-8 lg:py-10'
        )}
      >
        {/* 데스크탑 헤더 */}
        <header
          className={cn(
            'hidden flex-col gap-4 border-b border-gray-100 pb-5',
            'lg:flex lg:flex-row lg:items-end lg:justify-between'
          )}
        >
          <div className="flex flex-col gap-1.5">
            <h1
              className={cn(
                'text-3xl font-extrabold tracking-tight text-gray-900'
              )}
            >
              일지 보드
            </h1>
            <p className="text-lg font-normal text-gray-500">
              다른 챌린저의 일지를 보며 동기부여를 얻어보세요.
            </p>
          </div>
        </header>

        <DiaryCardSkeletonGrid count={12} className="mt-6" />
      </div>
    </div>
  );
}
