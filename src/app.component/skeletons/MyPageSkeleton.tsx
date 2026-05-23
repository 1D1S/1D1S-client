import { Skeleton } from '@component/Skeleton';
import { ChallengeCardSkeleton } from '@component/skeletons/ChallengeCardSkeleton';
import { DiaryCardSkeleton } from '@component/skeletons/DiaryCardSkeleton';
import { cn } from '@module/utils/cn';
import React from 'react';

export function MyPageSkeleton(): React.ReactElement {
  return (
    <div className="min-h-screen w-full bg-white pb-12">
      {/* 데스크탑 그라데이션 배너 자리 */}
      <Skeleton
        shape="rect"
        className="hidden h-[200px] w-full rounded-none lg:block"
      />

      <div className={cn('mx-auto w-full max-w-[1200px]', 'lg:px-8')}>
        {/* 프로필 카드 */}
        <div
          className={cn(
            'flex flex-col gap-4 bg-white p-5',
            'lg:-mt-16 lg:rounded-[20px] lg:p-7 lg:shadow-sm'
          )}
        >
          <div className="flex items-center gap-4">
            <Skeleton
              shape="circle"
              className="h-20 w-20 lg:h-24 lg:w-24"
            />
            <div className="flex flex-col gap-2">
              <Skeleton shape="text" className="h-5 w-32" />
              <Skeleton shape="text" className="h-3.5 w-40" />
            </div>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-3 lg:hidden">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-2xl',
                  'bg-gray-50 px-3 py-4'
                )}
              >
                <Skeleton shape="text" className="h-5 w-8" />
                <Skeleton shape="text" className="h-3 w-12" />
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 lg:px-0">
          {/* 친구 진입 */}
          <div className="mt-6">
            <Skeleton
              shape="rounded"
              className="h-[64px] w-full rounded-[14px]"
            />
          </div>

          {/* Streak hero + Heatmap — 데스크탑 */}
          <div
            className={cn(
              'mt-6 hidden grid-cols-1 gap-4',
              'lg:grid lg:grid-cols-2 lg:gap-5'
            )}
          >
            <Skeleton
              shape="rounded"
              className="h-[180px] w-full rounded-2xl"
            />
            <Skeleton
              shape="rounded"
              className="h-[180px] w-full rounded-2xl"
            />
          </div>

          {/* 통계 섹션 — 데스크탑 */}
          <div className="mt-8 hidden lg:block">
            <div className="flex flex-col gap-3">
              <Skeleton shape="text" className="h-5 w-24" />
              <Skeleton shape="text" className="h-3.5 w-44" />
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2.5">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton
                  key={index}
                  shape="rounded"
                  className="h-[114px] w-full rounded-xl"
                />
              ))}
            </div>
          </div>

          {/* 배지 섹션 */}
          <div className="mt-8 flex flex-col gap-3">
            <Skeleton shape="text" className="h-5 w-24" />
            <div
              className={cn(
                'grid grid-cols-2 gap-2.5',
                'sm:grid-cols-3 md:grid-cols-5 md:gap-3',
              )}
            >
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center gap-2"
                >
                  <Skeleton shape="circle" className="h-14 w-14" />
                  <Skeleton shape="text" className="h-2.5 w-10" />
                </div>
              ))}
            </div>
          </div>

          {/* 활성 챌린지 */}
          <div className="mt-8 flex flex-col gap-3">
            <Skeleton shape="text" className="h-5 w-32" />
            <div className="-mx-5 overflow-x-auto px-5 py-2">
              <div className="flex w-max gap-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="w-[220px] shrink-0"
                >
                  <ChallengeCardSkeleton />
                </div>
              ))}
              </div>
            </div>
          </div>

          {/* 내 일지 */}
          <div className="mt-8 flex flex-col gap-3">
            <Skeleton shape="text" className="h-5 w-20" />
            <div className="overflow-x-auto">
              <div className="flex w-max gap-3 py-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="w-[240px] shrink-0"
                >
                  <DiaryCardSkeleton />
                </div>
              ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
