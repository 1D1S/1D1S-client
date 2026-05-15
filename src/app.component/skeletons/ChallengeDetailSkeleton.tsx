'use client';

import { Skeleton } from '@component/Skeleton';
import { cn } from '@module/utils/cn';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

export function ChallengeDetailSkeleton(): React.ReactElement {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full bg-white lg:bg-gray-50/60">
      {/* 히어로 + 모바일 floating 뒤로가기 */}
      <div className="relative">
        <Skeleton
          shape="rect"
          className={cn(
            'h-[200px] w-full rounded-none lg:h-[260px]'
          )}
        />
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => router.back()}
          className={cn(
            'absolute top-3.5 left-3.5 z-10 flex h-9 w-9',
            'items-center justify-center rounded-full bg-white/90',
            'text-gray-700 shadow-sm backdrop-blur',
            'transition hover:bg-white lg:hidden'
          )}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
      </div>

      {/* 모바일 컨텐츠 헤더 — 히어로 위로 오버레이 */}
      <div
        className={cn(
          'relative z-10 -mt-5 rounded-t-[20px] bg-white px-5',
          'pt-5 pb-1 lg:hidden'
        )}
      >
        <div className="flex items-center gap-1.5">
          <Skeleton shape="pill" className="h-5 w-14" />
          <Skeleton shape="pill" className="h-5 w-14" />
        </div>
        <Skeleton shape="text" className="mt-3 h-6 w-[80%]" />
        <Skeleton shape="text" className="mt-2 h-3 w-[60%]" />
      </div>

      <div
        className={cn(
          'relative z-10 flex w-full flex-col gap-3 px-5 pt-3',
          'sm:pt-6 md:px-6 lg:gap-4 lg:px-8 lg:pt-8'
        )}
      >
        <div
          className={cn(
            'grid grid-cols-1 gap-4',
            'lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-7'
          )}
        >
          {/* 메인 콘텐츠 */}
          <div className="flex min-w-0 flex-col gap-3.5 lg:gap-4">
            {/* 챌린지 소개 카드 */}
            <section
              className={cn(
                'rounded-[14px] border border-gray-100 bg-gray-50',
                'lg:border-gray-200 lg:bg-white',
                'p-4 sm:p-5 lg:p-6'
              )}
            >
              <Skeleton shape="text" className="mb-3 h-5 w-32" />
              <div className="flex flex-col gap-2">
                <Skeleton shape="text" className="h-3.5 w-full" />
                <Skeleton shape="text" className="h-3.5 w-[92%]" />
                <Skeleton shape="text" className="h-3.5 w-[60%]" />
              </div>
            </section>

            {/* 목표 카드 */}
            <section
              className={cn(
                'rounded-[14px] border border-gray-100 bg-gray-50',
                'lg:border-gray-200 lg:bg-white',
                'p-4 sm:p-5 lg:p-6'
              )}
            >
              <Skeleton shape="text" className="mb-3 h-5 w-28" />
              <div className="flex flex-col gap-2.5">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Skeleton shape="rounded" className="h-5 w-5" />
                    <Skeleton shape="text" className="h-3.5 w-[55%]" />
                  </div>
                ))}
              </div>
            </section>

            {/* 참여자 일지 */}
            <section
              className={cn(
                'rounded-[14px] border border-gray-100 bg-gray-50',
                'lg:border-gray-200 lg:bg-white',
                'p-4 sm:p-5 lg:p-6'
              )}
            >
              <Skeleton shape="text" className="mb-3 h-5 w-32" />
              <div
                className={cn(
                  'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4'
                )}
              >
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton
                    key={index}
                    shape="rounded"
                    className="aspect-[3/4] w-full"
                  />
                ))}
              </div>
            </section>
          </div>

          {/* 우측 sticky rail */}
          <aside
            className={cn(
              'flex min-w-0 flex-col gap-3.5',
              'lg:sticky lg:top-6 lg:self-start'
            )}
          >
            <div className="hidden lg:block">
              <Skeleton
                shape="rounded"
                className="h-[260px] w-full rounded-2xl"
              />
            </div>
            <Skeleton
              shape="rounded"
              className="h-[280px] w-full rounded-2xl"
            />
          </aside>
        </div>
      </div>
    </div>
  );
}
