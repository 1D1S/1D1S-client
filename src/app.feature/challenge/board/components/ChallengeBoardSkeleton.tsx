import { Skeleton } from '@component/Skeleton';
import { ChallengeCardSkeletonGrid } from '@component/skeletons/ChallengeCardSkeleton';
import { cn } from '@module/utils/cn';
import Link from 'next/link';
import React from 'react';

import { formatDateRange } from '../../detail/utils/challengeLabels';
import type { ChallengeListItem } from '../type/challenge';

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
interface ChallengeBoardSkeletonProps {
  /**
   * 서버가 비인증 GET /challenges 로 미리 읽어 둔 공개 목록. 있으면 카드
   * 스켈레톤 대신 실제 챌린지 링크를 그린다 — 이 fallback 이 곧 크롤러가
   * 보는 초기 HTML 이라, 비어 있으면 목록 페이지가 알맹이 없이 색인된다.
   */
  challenges?: ChallengeListItem[];
}

// 기간 표기는 카드/상세와 같은 함수를 쓴다. 직접 만들었더니 무기한
// 챌린지의 종료일 센티넬(9999-12-31)을 그대로 찍어, 초기 HTML 에만
// "2026.08.31 ~ 9999.12.31" 이 노출됐다.
function formatPeriod({ startDate, endDate }: ChallengeListItem): string {
  if (!startDate || !endDate) {
    return '';
  }

  return formatDateRange(startDate, endDate);
}

export function ChallengeBoardSkeleton({
  challenges,
}: ChallengeBoardSkeletonProps = {}): React.ReactElement {
  return (
    <div data-skeleton-group className="w-full">
      {/* 모바일 sticky 헤더 */}
      <div
        className={cn(
          'sticky top-0 z-20 border-b border-gray-100',
          'bg-white px-5 pt-[calc(0.875rem+env(safe-area-inset-top))] pb-3',
          'lg:hidden'
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

        {/* 카드 그리드 — 공개 목록을 받았으면 실제 챌린지 링크를 그린다. */}
        {challenges?.length ? (
          <ul
            className={cn(
              'mt-4 grid grid-cols-2 gap-4 lg:mt-6',
              'md:grid-cols-3 xl:grid-cols-4'
            )}
          >
            {challenges.map((challenge) => (
              <li key={challenge.challengeId}>
                <Link
                  href={`/challenge/${challenge.challengeId}`}
                  className={cn(
                    'flex h-full flex-col gap-1.5 rounded-[14px]',
                    'border border-gray-100 bg-white p-4'
                  )}
                >
                  <h2
                    className={cn(
                      'line-clamp-2 text-base font-bold break-keep',
                      'text-gray-900'
                    )}
                  >
                    {challenge.title}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {formatPeriod(challenge)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <ChallengeCardSkeletonGrid count={8} className="mt-4 gap-4 lg:mt-6" />
        )}
      </div>
    </div>
  );
}
