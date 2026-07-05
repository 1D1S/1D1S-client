import { Skeleton } from '@component/Skeleton';
import { ChallengeCardSkeletonGrid } from '@component/skeletons/ChallengeCardSkeleton';
import { cn } from '@module/utils/cn';
import React from 'react';

/**
 * 챌린지 보드 페이지 진입 시 Suspense fallback 으로 사용.
 *
 * 헤더·검색바·카테고리 칩 같이 데이터가 필요 없는 정적 요소는 그대로 노출하고,
 * 카드 영역만 스켈레톤으로 채워 페이지 진입 시 레이아웃 시프트를 최소화한다.
 *
 * 텍스트 크기는 design-system Text 토큰에 매칭:
 *   heading1 / pageTitle = text-3xl, body2 = text-lg
 * (서버 컴포넌트라 `@1d1s/design-system` 의 Text 를 직접 import 할 수 없어
 *  동등한 Tailwind 클래스를 쓴다.)
 */
export function ChallengeBoardSkeleton(): React.ReactElement {
  return (
    <div className="w-full">
      {/* 모바일 sticky 헤더 */}
      <div
        className={cn(
          'sticky top-0 z-20 border-b border-gray-100',
          'bg-white/95 px-5 pt-[calc(0.875rem+env(safe-area-inset-top))] pb-3',
          'backdrop-blur lg:hidden'
        )}
      >
        <div className="mb-3 flex items-center justify-between">
          <h1
            className={cn(
              'text-3xl font-extrabold tracking-[-0.5px] text-gray-900'
            )}
          >
            챌린지
          </h1>
          <Skeleton shape="pill" className="h-7 w-20" />
        </div>
        <Skeleton shape="rounded" className="h-10 w-full" />
        {/* 필터 토글 2행 — 실제 화면(ChallengeBoardFilters)과 높이 동기 */}
        <div className="mt-3 flex flex-col gap-2.5">
          {Array.from({ length: 2 }).map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="scrollbar-hide -mx-5 flex gap-1.5 overflow-x-auto px-5"
            >
              {Array.from({ length: rowIndex === 0 ? 8 : 7 }).map(
                (_, index) => (
                  <Skeleton
                    key={index}
                    shape="pill"
                    className="h-8 w-16 shrink-0"
                  />
                )
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1200px] px-5 py-5 lg:px-8 lg:py-10">
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
              챌린지 보드
            </h1>
            <p className="text-lg font-normal text-gray-500">
              새로운 습관을 만들고 함께 성장할 챌린지를 찾아보세요.
            </p>
          </div>
          <Skeleton shape="rounded" className="h-10 w-32 self-start" />
        </header>

        <div className="mt-2 flex flex-col gap-4 lg:mt-6">
          {/* 데스크탑 검색바 */}
          <div className="hidden w-full max-w-[480px] gap-2 lg:flex">
            <Skeleton shape="rounded" className="h-10 flex-1" />
            <Skeleton shape="rounded" className="h-10 w-20" />
          </div>

          {/* 필터 토글 2행(카테고리 / 종류+상태) — 데스크탑 전용.
              모바일(<lg)은 sticky 헤더 쪽 스켈레톤이 담당한다. */}
          <div className="hidden flex-col gap-2.5 lg:flex">
            {Array.from({ length: 2 }).map((_, rowIndex) => (
              <div key={rowIndex} className="flex flex-wrap gap-1.5">
                {Array.from({ length: rowIndex === 0 ? 8 : 7 }).map(
                  (_, index) => (
                    <Skeleton
                      key={index}
                      shape="pill"
                      className="h-8 w-16 shrink-0"
                    />
                  )
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 카드 그리드 */}
        <ChallengeCardSkeletonGrid count={8} className="mt-4 gap-4 lg:mt-6" />
      </div>
    </div>
  );
}
