'use client';

import { MobileHeader, Text } from '@1d1s/design-system';
import { useSafeBack } from '@module/hooks/useSafeBack';
import { cn } from '@module/utils/cn';
import React from 'react';

import { ChallengeDiaryList } from '../components/ChallengeDiaryList';

interface ChallengeDiaryListScreenProps {
  id: string;
  // 캘린더에서 넘어온 날짜 필터 (YYYY-MM-DD). 없으면 전체 목록.
  date?: string;
}

export function ChallengeDiaryListScreen({
  id,
  date,
}: ChallengeDiaryListScreenProps): React.ReactElement {
  const activeDate =
    date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : undefined;
  // 필터 중엔 뒤로가기를 전체 목록으로 보내 해제 동선을 자연스럽게 한다.
  const handleBack = useSafeBack(
    activeDate ? `/challenge/${id}/diary` : `/challenge/${id}`
  );

  return (
    <div className="min-h-screen w-full">
      <MobileHeader title="챌린지 일지" onBack={handleBack} />

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
              챌린지 일지
            </Text>
            <Text size="body2" weight="regular" className="text-gray-500">
              챌린지 참여자가 작성한 일지 목록입니다.
            </Text>
          </div>
        </header>

        <div className="mt-5 lg:mt-6">
          <ChallengeDiaryList
            id={id}
            date={date}
            clearHref={`/challenge/${id}/diary`}
          />
        </div>
      </div>
    </div>
  );
}
