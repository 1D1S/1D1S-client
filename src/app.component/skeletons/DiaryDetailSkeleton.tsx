'use client';

import { MobileHeader } from '@component/layout/MobileHeader';
import { Skeleton } from '@component/Skeleton';
import { DiaryCommentsSkeleton } from '@component/skeletons/DiaryCommentsSkeleton';
import { cn } from '@module/utils/cn';
import React from 'react';

export function DiaryDetailSkeleton(): React.ReactElement {
  return (
    <div
      className={cn(
        'min-h-screen w-full bg-white',
        'pb-mobile-action-bar-tall lg:pb-0'
      )}
    >
      <MobileHeader title="일지" />

      <div
        className={cn(
          'mx-auto w-full max-w-[1200px]',
          'px-4 py-3 sm:px-5 sm:py-7 lg:px-8 lg:py-10'
        )}
      >
        <div
          className={cn(
            'grid gap-4 lg:gap-7',
            'lg:grid-cols-[minmax(0,1fr)_380px]'
          )}
        >
          <article className="flex min-w-0 flex-col gap-3.5">
            {/* 작성자 + 액션 카드 */}
            <section
              className={cn(
                'flex items-center gap-3',
                'lg:rounded-[14px] lg:border lg:border-gray-200',
                'lg:bg-white lg:p-4'
              )}
            >
              <Skeleton shape="circle" className="h-10 w-10" />
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <Skeleton shape="text" className="h-3.5 w-24" />
                <Skeleton shape="text" className="h-3 w-16" />
              </div>
              <Skeleton shape="rounded" className="h-8 w-16 rounded-lg" />
            </section>

            {/* 연동 챌린지 카드 — 풀 리스트 아이템 높이 */}
            <Skeleton
              shape="rounded"
              className="h-[95px] w-full rounded-[14px] sm:h-[119px]"
            />

            {/* 제목 + 액션 툴바 섹션 */}
            <section
              className={cn(
                'lg:rounded-[14px] lg:border lg:border-gray-200',
                'lg:bg-white lg:p-6'
              )}
            >
              <Skeleton shape="text" className="h-7 w-[70%]" />
              <div className="mt-4 flex items-center gap-2">
                <Skeleton shape="rounded" className="h-9 w-16 rounded-full" />
                <Skeleton shape="rounded" className="h-9 w-16 rounded-full" />
                <Skeleton shape="rounded" className="h-9 w-12 rounded-full" />
              </div>
            </section>

            {/* 오늘의 기분 + 달성률 */}
            <Skeleton
              shape="rounded"
              className="h-12 w-full rounded-[10px]"
            />

            {/* 목표 체크리스트 카드 */}
            <section
              className={cn(
                'rounded-[14px] border border-gray-200 bg-white',
                'p-4 sm:p-5 lg:p-6'
              )}
            >
              <Skeleton shape="text" className="h-4 w-24" />
              <div className="mt-3 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Skeleton shape="circle" className="h-5 w-5" />
                  <Skeleton shape="text" className="h-3.5 w-[60%]" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton shape="circle" className="h-5 w-5" />
                  <Skeleton shape="text" className="h-3.5 w-[50%]" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton shape="circle" className="h-5 w-5" />
                  <Skeleton shape="text" className="h-3.5 w-[45%]" />
                </div>
              </div>
            </section>

            {/* 오늘의 기록 (이미지 + 본문) — 모바일·태블릿은 플랫 */}
            <section
              className={cn(
                'lg:rounded-[14px] lg:border lg:border-gray-200',
                'lg:bg-white lg:p-6'
              )}
            >
              <Skeleton shape="text" className="hidden h-3 w-20 lg:block" />
              <div className="flex flex-col gap-2.5 lg:mt-3.5">
                <Skeleton shape="text" className="h-3.5 w-full" />
                <Skeleton shape="text" className="h-3.5 w-full" />
                <Skeleton shape="text" className="h-3.5 w-[88%]" />
                <Skeleton shape="text" className="h-3.5 w-[60%]" />
              </div>
              {/* 하단 정사각형 이미지 갤러리 */}
              <div className="mt-5 flex gap-2.5">
                <Skeleton
                  shape="rounded"
                  className="aspect-square w-[200px] max-w-full rounded-xl"
                />
              </div>
            </section>
          </article>

          {/* 데스크탑 댓글 사이드바 */}
          <aside className="hidden lg:block">
            <div
              className={cn(
                'rounded-[14px] border border-gray-200 bg-white',
                'sticky top-5'
              )}
            >
              <div className="p-5">
                <Skeleton shape="text" className="mb-3 h-4 w-24" />
                <DiaryCommentsSkeleton count={3} />
                <div className="mt-3 flex items-end gap-1.5">
                  <Skeleton shape="rounded" className="h-[68px] flex-1" />
                  <Skeleton shape="rounded" className="h-8 w-12 rounded-lg" />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
