'use client';

import { Text } from '@1d1s/design-system';
import { Skeleton } from '@component/Skeleton';
import { DiaryCommentsSkeleton } from '@component/skeletons/DiaryCommentsSkeleton';
import { cn } from '@module/utils/cn';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

export function DiaryDetailSkeleton(): React.ReactElement {
  const router = useRouter();

  return (
    <div
      className={cn(
        'min-h-screen w-full bg-white',
        'pb-mobile-action-bar-tall lg:pb-0'
      )}
    >
      {/* 모바일 sticky 헤더 — ← + 일지 */}
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
          onClick={() => router.back()}
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
          일지
        </Text>
      </div>

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

            {/* 좋아요/댓글 액션 툴바 */}
            <div
              className={cn(
                'flex items-center gap-4',
                'border-y border-gray-100 py-3'
              )}
            >
              <div className="flex items-center gap-1.5">
                <Skeleton shape="circle" className="h-5 w-5" />
                <Skeleton shape="text" className="h-3 w-6" />
              </div>
              <div className="flex items-center gap-1.5">
                <Skeleton shape="circle" className="h-5 w-5" />
                <Skeleton shape="text" className="h-3 w-6" />
              </div>
              <div className="ml-auto">
                <Skeleton shape="circle" className="h-5 w-5" />
              </div>
            </div>

            {/* 연동된 챌린지 카드 — 실제 카드 높이(썸네일 aspect-video
                + 패딩)와 맞춰 로드 후 레이아웃 시프트를 막는다 */}
            <Skeleton
              shape="rounded"
              className="h-[95px] w-full rounded-[14px] sm:h-[119px]"
            />

            {/* 제목 + 감정 메터 섹션 */}
            <section
              className={cn(
                'lg:rounded-[14px] lg:border lg:border-gray-200',
                'lg:bg-white lg:p-6'
              )}
            >
              <Skeleton shape="text" className="h-7 w-[70%]" />
              <Skeleton
                shape="rounded"
                className="mt-3.5 h-10 w-full rounded-[10px]"
              />
            </section>

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
                  <Skeleton shape="rounded" className="h-5 w-5" />
                  <Skeleton shape="text" className="h-3.5 w-[60%]" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton shape="rounded" className="h-5 w-5" />
                  <Skeleton shape="text" className="h-3.5 w-[50%]" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton shape="rounded" className="h-5 w-5" />
                  <Skeleton shape="text" className="h-3.5 w-[45%]" />
                </div>
              </div>
            </section>

            {/* 오늘의 기록 (이미지 + 본문) */}
            <section
              className={cn(
                'rounded-[14px] border border-gray-200 bg-white',
                'p-4 sm:p-5 lg:p-6'
              )}
            >
              <Skeleton shape="text" className="h-3 w-20" />
              <Skeleton
                shape="rounded"
                className="mt-3.5 aspect-[4/5] w-full rounded-2xl"
              />
              <div className="mt-4 flex flex-col gap-2.5">
                <Skeleton shape="text" className="h-3.5 w-full" />
                <Skeleton shape="text" className="h-3.5 w-full" />
                <Skeleton shape="text" className="h-3.5 w-[88%]" />
                <Skeleton shape="text" className="h-3.5 w-[60%]" />
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
