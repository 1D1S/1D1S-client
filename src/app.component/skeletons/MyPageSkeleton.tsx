import { Skeleton } from '@component/Skeleton';
import { ChallengeCardSkeleton } from '@component/skeletons/ChallengeCardSkeleton';
import { DiaryCardSkeleton } from '@component/skeletons/DiaryCardSkeleton';
import { cn } from '@module/utils/cn';
import React from 'react';

// 실제 MyPageScreen 레이아웃과 1:1로 맞춘 스켈레톤.
// - 풀블리드 배너 h-[180px] (MyPageHeroBanner)
// - 컨테이너 px-5 py-5 lg:px-8 lg:py-10 (MyPageScreen 컨테이너)
// - 데스크탑 프로필 카드: -mt-25 로 배너에 겹치고 border 만(그림자 없음)
export function MyPageSkeleton(): React.ReactElement {
  return (
    <div className="min-h-screen w-full bg-white">
      {/* 데스크탑 풀블리드 그라데이션 배너 자리 (실제 h-[180px]) */}
      <Skeleton
        shape="rect"
        className="hidden h-[180px] w-full rounded-none lg:block"
      />

      <div
        className={cn(
          'mx-auto w-full max-w-[1200px]',
          'px-5 py-5 lg:px-8 lg:py-10'
        )}
      >
        {/* 모바일 프로필 */}
        <div className="lg:hidden">
          <div className="flex min-h-8 items-center justify-end gap-1">
            <Skeleton shape="rounded" className="h-8 w-8 rounded-lg" />
            <Skeleton shape="rounded" className="h-8 w-8 rounded-lg" />
          </div>
          <div className="mt-1 flex items-center gap-3.5">
            <Skeleton shape="circle" className="h-18 w-18 shrink-0" />
            <Skeleton shape="text" className="h-6 w-32" />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2.5">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton
                key={index}
                shape="rounded"
                className="h-[68px] w-full rounded-[12px]"
              />
            ))}
          </div>
        </div>

        {/* 데스크탑 프로필 카드 — 배너에 -mt-25 로 겹쳐 올라온다 */}
        <div
          className={cn(
            'rounded-4 relative -mt-25 hidden border border-gray-200',
            'bg-white p-5 lg:flex lg:items-center lg:gap-5 lg:p-6'
          )}
        >
          <Skeleton shape="circle" className="h-24 w-24 shrink-0" />
          <div className="flex flex-1 flex-col gap-3">
            <Skeleton shape="text" className="h-7 w-40" />
            <div className="flex gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} shape="text" className="h-4 w-24" />
              ))}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Skeleton shape="rounded" className="h-10 w-24 rounded-lg" />
            <Skeleton shape="rounded" className="h-10 w-10 rounded-lg" />
          </div>
        </div>

        {/* 친구 진입 (실제 ~72px, rounded-[14px]) */}
        <div className="mt-6">
          <Skeleton
            shape="rounded"
            className="h-[72px] w-full rounded-[14px]"
          />
        </div>

        {/* Streak hero + Heatmap — 데스크탑 2-col */}
        <div className="mt-6 hidden gap-5 lg:grid lg:grid-cols-2">
          <Skeleton shape="rounded" className="rounded-4 h-[200px] w-full" />
          <Skeleton shape="rounded" className="rounded-4 h-[200px] w-full" />
        </div>

        {/* 활동 잔디 — 모바일(실제 모바일은 잔디만 노출) */}
        <div className="mt-6 lg:hidden">
          <Skeleton shape="rounded" className="rounded-4 h-[180px] w-full" />
        </div>

        {/* 통계 섹션 — 데스크탑 전용 */}
        <div className="mt-8 hidden lg:block">
          <div className="flex flex-col gap-2">
            <Skeleton shape="text" className="h-5 w-24" />
            <Skeleton shape="text" className="h-3.5 w-44" />
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2.5">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton
                key={index}
                shape="rounded"
                className="rounded-3 h-[100px] w-full"
              />
            ))}
          </div>
        </div>

        {/* 배지 섹션 (제목 + 서브타이틀 + 5종) */}
        <div className="mt-8">
          <div className="flex flex-col gap-2">
            <Skeleton shape="text" className="h-5 w-24" />
            <Skeleton shape="text" className="h-3.5 w-20" />
          </div>
          <div
            className={cn(
              'mt-4 grid grid-cols-2 gap-2.5',
              'sm:grid-cols-3 md:grid-cols-5 md:gap-3'
            )}
          >
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton
                key={index}
                shape="rounded"
                className="rounded-3 h-[104px] w-full"
              />
            ))}
          </div>
        </div>

        {/* 진행 중인 챌린지 (제목 + 서브타이틀 + 가로 스크롤) */}
        <div className="mt-8">
          <div className="flex flex-col gap-2">
            <Skeleton shape="text" className="h-5 w-32" />
            <Skeleton shape="text" className="h-3.5 w-24" />
          </div>
          <div className="-mx-5 mt-4 overflow-x-auto px-5 py-2 lg:mx-0 lg:px-0">
            <div className="flex w-max gap-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="w-[220px] shrink-0">
                  <ChallengeCardSkeleton />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 내 일지 (제목 + 가로 스크롤) */}
        <div className="mt-8">
          <Skeleton shape="text" className="h-6 w-20" />
          <div className="-mx-5 mt-4 overflow-x-auto px-5 py-2 lg:mx-0 lg:px-0">
            <div className="flex w-max gap-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="w-[240px] shrink-0">
                  <DiaryCardSkeleton />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
