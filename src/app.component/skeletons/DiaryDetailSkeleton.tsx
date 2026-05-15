'use client';

import { Text } from '@1d1s/design-system';
import { Skeleton } from '@component/Skeleton';
import { cn } from '@module/utils/cn';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

export function DiaryDetailSkeleton(): React.ReactElement {
  const router = useRouter();

  return (
    <div
      className={cn(
        'min-h-screen w-full bg-white pb-[72px]',
        'lg:bg-gray-50/60 lg:pb-0'
      )}
    >
      {/* 모바일 sticky 헤더 — ← + 일지 */}
      <div
        className={cn(
          'sticky top-0 z-30 flex h-14 items-center gap-3',
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
          'mx-auto flex w-full max-w-[820px] flex-col gap-5',
          'px-4 py-6 lg:px-8 lg:py-10'
        )}
      >
        {/* 작성자 영역 */}
        <div className="flex items-center gap-3">
          <Skeleton shape="circle" className="h-10 w-10" />
          <div className="flex flex-col gap-1.5">
            <Skeleton shape="text" className="h-3.5 w-24" />
            <Skeleton shape="text" className="h-3 w-16" />
          </div>
        </div>

        {/* 제목 */}
        <Skeleton shape="text" className="h-7 w-[70%]" />

        {/* 챌린지 칩 */}
        <Skeleton shape="pill" className="h-6 w-32" />

        {/* 이미지 */}
        <Skeleton
          shape="rounded"
          className="aspect-[4/3] w-full rounded-2xl"
        />

        {/* 본문 */}
        <div className="flex flex-col gap-2.5">
          <Skeleton shape="text" className="h-3.5 w-full" />
          <Skeleton shape="text" className="h-3.5 w-full" />
          <Skeleton shape="text" className="h-3.5 w-[88%]" />
          <Skeleton shape="text" className="h-3.5 w-[60%]" />
        </div>

        {/* 목표 체크리스트 */}
        <div className="mt-2 flex flex-col gap-3">
          <Skeleton shape="text" className="h-4 w-24" />
          <div className="flex flex-col gap-2">
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
        </div>

        {/* 좋아요/댓글 액션 */}
        <div className="mt-3 flex items-center gap-4 border-t border-gray-100 pt-4">
          <div className="flex items-center gap-1.5">
            <Skeleton shape="circle" className="h-5 w-5" />
            <Skeleton shape="text" className="h-3 w-6" />
          </div>
          <div className="flex items-center gap-1.5">
            <Skeleton shape="circle" className="h-5 w-5" />
            <Skeleton shape="text" className="h-3 w-6" />
          </div>
        </div>
      </div>
    </div>
  );
}
