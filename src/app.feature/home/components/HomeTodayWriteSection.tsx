'use client';

import { SectionHeader } from '@1d1s/design-system';
import {
  CategoryIcon,
  getCategoryLabel,
  getCategoryStripeTone,
} from '@constants/categories';
import type { SidebarChallenge } from '@feature/member/type/member';
import { cn } from '@module/utils/cn';
import { useRouter } from 'next/navigation';
import React from 'react';

import { useTodayWriteStatus } from '../hooks/useTodayWriteStatus';

interface HomeTodayWriteSectionProps {
  /** 진행 중(종료·아카이브 제외) 챌린지 */
  challenges: SidebarChallenge[];
  /** 인증/사이드바 확정 전 — 스켈레톤을 노출한다. */
  isAuthLoading: boolean;
}

// 스켈레톤·리스트·완료·(진행 중 0개)null 상태가 모두 같은 높이를 차지하도록
// 고정 높이 가로 스트립으로 구성한다. 미작성 개수가 달라져도 세로 흐름이
// 밀리지 않아 아래 섹션(참여 중 챌린지·스토리)에 시프트가 없다.
const STRIP_MIN = 'min-h-[104px]';
const STRIP_ROW = cn(
  'mt-3 flex items-stretch gap-2.5 overflow-x-auto py-1',
  'scrollbar-hide snap-x snap-mandatory',
  STRIP_MIN
);
const PILL_ITEM = 'w-[230px] shrink-0 snap-start';

export default function HomeTodayWriteSection({
  challenges,
  isAuthLoading,
}: HomeTodayWriteSectionProps): React.ReactElement | null {
  const router = useRouter();
  const { pending, doneCount, isLoading } = useTodayWriteStatus(challenges);

  // 진행 중 챌린지가 전혀 없으면 이 섹션은 비운다. "참여 중인 챌린지" 섹션이
  // 빈 상태 안내를 담당하므로 중복 빈 카드를 만들지 않는다.
  if (!isAuthLoading && challenges.length === 0) {
    return null;
  }

  const showSkeleton = isAuthLoading || isLoading;

  return (
    <section className="w-full">
      <SectionHeader
        size="sm"
        title="오늘의 기록"
        actionLabel={
          !showSkeleton && pending.length > 0 ? '일지 쓰기 →' : undefined
        }
        onActionClick={
          !showSkeleton && pending.length > 0
            ? () => router.push('/diary/create')
            : undefined
        }
      />

      {showSkeleton ? (
        <div className={STRIP_ROW}>
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className={PILL_ITEM}>
              <div
                className={cn(
                  'skeleton-pulse rounded-3 h-full w-full',
                  'bg-gray-100'
                )}
              />
            </div>
          ))}
        </div>
      ) : pending.length > 0 ? (
        <div className={cn(STRIP_ROW, 'data-fade-in')}>
          {pending.map((challenge) => {
            const tone = getCategoryStripeTone(challenge.category);
            return (
              <div key={challenge.challengeId} className={PILL_ITEM}>
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/diary/create?challengeId=${challenge.challengeId}`
                    )
                  }
                  aria-label={`${challenge.title} 오늘 기록하기`}
                  className={cn(
                    'group flex h-full w-full flex-col justify-between',
                    'rounded-3 border-main-200 bg-main-100 border p-3.5',
                    'cursor-pointer text-left transition hover:brightness-105'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'inline-flex h-5 w-5 shrink-0 items-center',
                        'justify-center rounded-full bg-white text-gray-700'
                      )}
                      style={{ color: tone }}
                    >
                      <CategoryIcon
                        category={challenge.category}
                        className="h-3 w-3"
                      />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-gray-900">
                      {challenge.title}
                    </span>
                  </div>
                  <span className="mt-2.5 flex items-center justify-between">
                    <span className="text-[11px] text-gray-500">
                      {getCategoryLabel(challenge.category)}
                    </span>
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full',
                        'bg-brand px-3 py-1 text-[11px] font-bold text-white'
                      )}
                    >
                      기록하기 →
                    </span>
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          className={cn(
            'mt-3 flex items-center justify-center gap-2',
            'rounded-3 border-main-200 bg-main-100 border px-4',
            STRIP_MIN,
            'data-fade-in'
          )}
        >
          <span className="text-[14px] font-medium text-gray-800">
            오늘 기록을 모두 마쳤어요 🎉
          </span>
          {doneCount > 0 ? (
            <span className="text-[13px] text-gray-500">
              {doneCount}개 완료
            </span>
          ) : null}
        </div>
      )}
    </section>
  );
}
