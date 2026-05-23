'use client';

import { Skeleton } from '@component/Skeleton';
import { DiaryCardSkeleton } from '@component/skeletons/DiaryCardSkeleton';
import { cn } from '@module/utils/cn';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

export function ChallengeDetailSkeleton(): React.ReactElement {
  const router = useRouter();

  return (
    <>
      <div
        className={cn(
          'min-h-screen w-full bg-white',
          'pb-[calc(100px+env(safe-area-inset-bottom))] lg:pb-12'
        )}
      >
        {/* 히어로 + 모바일 floating 뒤로가기 */}
        <div className="relative">
          <div
            className={cn(
              'relative aspect-[21/9] w-full overflow-hidden bg-gray-100'
            )}
          >
            <Skeleton shape="rect" className="absolute inset-0 rounded-none" />
            <div
              className={cn(
                'absolute inset-0 hidden flex-col justify-end gap-2.5',
                'p-6 md:p-8 lg:flex'
              )}
            >
              <div className="flex flex-wrap items-center gap-1.5">
                <Skeleton shape="pill" className="h-6 w-20" />
                <Skeleton shape="pill" className="h-6 w-20" />
              </div>
              <Skeleton shape="text" className="h-11 w-[65%]" />
              <Skeleton shape="text" className="h-5 w-[40%]" />
            </div>
          </div>
          <button
            type="button"
            aria-label="뒤로가기"
            onClick={() => router.back()}
            className={cn(
              'absolute left-3.5 z-10 flex h-9 w-9',
              'top-[calc(0.875rem+env(safe-area-inset-top))]',
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
            'relative z-10 -mt-5 rounded-t-[20px] bg-white px-5 pt-5 pb-1',
            'lg:hidden'
          )}
        >
          <div className="flex flex-wrap items-center gap-1.5">
            <Skeleton shape="pill" className="h-5 w-14" />
            <Skeleton shape="pill" className="h-5 w-14" />
          </div>
          <Skeleton shape="text" className="mt-2.5 h-7 w-[84%]" />
          <div className="mt-1.5 flex items-center justify-between gap-2">
            <Skeleton shape="text" className="h-3 w-[55%]" />
            <Skeleton shape="pill" className="h-6 w-14" />
          </div>
          <div
            className={cn(
              'mt-4 flex items-center gap-2.5 rounded-[12px]',
              'bg-main-100 px-3.5 py-3'
            )}
          >
            <div className="flex">
              <Skeleton
                shape="circle"
                className="h-7 w-7 border-2 border-white"
              />
              <Skeleton
                shape="circle"
                className="-ml-2.5 h-7 w-7 border-2 border-white"
              />
              <Skeleton
                shape="circle"
                className="-ml-2.5 h-7 w-7 border-2 border-white"
              />
            </div>
            <Skeleton shape="text" className="h-3.5 w-32" />
          </div>
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
                <div className="mt-3 hidden flex-wrap items-center gap-1.5 lg:flex">
                  <Skeleton shape="pill" className="h-5 w-16" />
                  <Skeleton shape="pill" className="h-5 w-16" />
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
                <div className="mb-3 flex items-center justify-between gap-2">
                  <Skeleton shape="text" className="h-5 w-12" />
                  <Skeleton shape="rounded" className="h-8 w-16" />
                </div>
                <div className="flex flex-col gap-1.5">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className={cn(
                        'flex items-start gap-2.5 rounded-[10px]',
                        'border border-gray-100 bg-white px-3.5 py-2.5',
                        'lg:bg-gray-50'
                      )}
                    >
                      <Skeleton shape="text" className="mt-0.5 h-4 w-4" />
                      <Skeleton shape="text" className="h-5 w-[70%]" />
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
                <div className="mb-3 flex items-baseline justify-between gap-2">
                  <Skeleton shape="text" className="h-5 w-24" />
                  <Skeleton shape="text" className="h-3 w-14" />
                </div>
                <div
                  className={cn(
                    'scrollbar-hide flex gap-3 overflow-x-auto',
                    'sm:grid sm:gap-2.5 sm:overflow-visible',
                    'sm:grid-cols-[repeat(auto-fill,minmax(160px,200px))]'
                  )}
                >
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="w-[170px] shrink-0 sm:w-auto">
                      <DiaryCardSkeleton />
                    </div>
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
                <div className="rounded-2xl border border-gray-100 bg-white p-[18px]">
                  <div className="flex items-center justify-between">
                    <Skeleton shape="text" className="h-3.5 w-16" />
                    <Skeleton shape="pill" className="h-6 w-12" />
                  </div>
                  <Skeleton shape="text" className="mt-2 h-10 w-20" />
                  <Skeleton shape="rounded" className="mt-2.5 h-2.5 w-full" />
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <Skeleton shape="text" className="h-3 w-28" />
                    <Skeleton shape="text" className="h-3 w-20" />
                  </div>
                  <Skeleton shape="rounded" className="mt-3.5 h-10 w-full" />
                </div>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white p-5">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <Skeleton shape="text" className="h-5 w-20" />
                  <Skeleton shape="text" className="h-3 w-10" />
                </div>
                <div className="flex flex-col">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div
                      key={index}
                      className={cn(
                        'flex items-center gap-2.5 rounded-md px-2 py-2.5',
                        index < 4 && 'border-b border-gray-100'
                      )}
                    >
                      <Skeleton shape="circle" className="h-8 w-8" />
                      <Skeleton shape="text" className="h-4 flex-1" />
                      <Skeleton shape="pill" className="h-5 w-10" />
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <div
        className={cn(
          'fixed right-0 bottom-0 left-0 z-20 border-t',
          'border-gray-200 bg-white/95 backdrop-blur lg:hidden'
        )}
      >
        <div
          className={cn(
            'mx-auto flex w-full max-w-[1200px] flex-col px-4 pt-3',
            'pb-[calc(0.75rem+env(safe-area-inset-bottom))]'
          )}
        >
          <Skeleton shape="rounded" className="h-11 w-full rounded-xl" />
          <Skeleton shape="text" className="mt-2 h-3 w-3/5 self-center" />
        </div>
      </div>
    </>
  );
}
