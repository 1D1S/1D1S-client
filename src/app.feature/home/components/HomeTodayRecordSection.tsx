'use client';

import { Button, SectionHeader } from '@1d1s/design-system';
import {
  CategoryIcon,
  getCategoryLabel,
  getCategoryStripeTone,
} from '@constants/categories';
import { isInfiniteChallengeEndDate } from '@feature/challenge/board/utils/challengePeriod';
import type { SidebarChallenge } from '@feature/member/type/member';
import { cn } from '@module/utils/cn';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';

import { useTodayRecords } from '../hooks/useTodayRecords';
import {
  formatChallengeRemainingLabel,
  isChallengeEndedOrArchived,
} from '../utils/homeFormatters';

interface HomeTodayRecordSectionProps {
  /** 사이드바의 참여 챌린지 전체 목록 */
  challenges: SidebarChallenge[];
  /** 인증/사이드바 확정 전 — 스켈레톤을 노출한다. */
  isAuthLoading: boolean;
}

// 목표 영역은 최대 3개까지만 노출한다(그 이상은 "+N개"). 로딩/개수와
// 무관하게 목표 블록 높이를 고정해 그리드 셀 높이·시프트를 안정화한다.
const MAX_GOALS = 3;
const GOALS_BLOCK = 'min-h-[62px]';
// 카드 최소 높이를 고정해 로딩→확정, 목표 개수 변화에도 그리드가 흔들리지
// 않게 한다.
const CARD_BASE =
  'flex min-h-[148px] flex-col gap-2.5 rounded-3 border p-3.5';

interface RecordCardProps {
  challenge: SidebarChallenge;
  writtenToday: boolean;
  isStatusLoading: boolean;
  goals: string[];
  goalsLoading: boolean;
}

function GoalsBlock({
  goals,
  goalsLoading,
  isFree,
}: {
  goals: string[];
  goalsLoading: boolean;
  isFree: boolean;
}): React.ReactElement {
  if (goalsLoading) {
    return (
      <div className={cn(GOALS_BLOCK, 'flex flex-col gap-1.5')}>
        <span className="skeleton-pulse h-3 w-4/5 rounded bg-gray-100" />
        <span className="skeleton-pulse h-3 w-3/5 rounded bg-gray-100" />
        <span className="skeleton-pulse h-3 w-2/3 rounded bg-gray-100" />
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <div className={cn(GOALS_BLOCK, 'flex items-center')}>
        <span className="text-[12px] text-gray-400">
          {isFree ? '자유 목표 챌린지예요' : '등록된 목표가 없어요'}
        </span>
      </div>
    );
  }

  const shown = goals.slice(0, MAX_GOALS);
  const restCount = goals.length - shown.length;

  return (
    <ul className={cn(GOALS_BLOCK, 'flex flex-col gap-1')}>
      {shown.map((goal, index) => (
        <li
          key={`${goal}-${index}`}
          className="flex items-start gap-1.5"
        >
          <span
            aria-hidden
            className="bg-main-400 mt-[7px] h-1 w-1 shrink-0 rounded-full"
          />
          <span className="truncate text-[13px] font-medium text-gray-800">
            {goal}
          </span>
        </li>
      ))}
      {restCount > 0 ? (
        <li className="pl-[10px] text-[11px] font-medium text-gray-400">
          +{restCount}개 더
        </li>
      ) : null}
    </ul>
  );
}

function RecordCard({
  challenge,
  writtenToday,
  isStatusLoading,
  goals,
  goalsLoading,
}: RecordCardProps): React.ReactElement {
  const router = useRouter();
  const tone = getCategoryStripeTone(challenge.category);
  const isInfinite = isInfiniteChallengeEndDate(challenge.endDate);
  const isFree = challenge.goalType === 'FLEXIBLE';
  const remainingLabel = formatChallengeRemainingLabel(
    challenge.endDate,
    isInfinite,
    false
  );

  return (
    <li
      className={cn(
        CARD_BASE,
        writtenToday
          ? 'border-gray-200 bg-white'
          : 'border-main-200 bg-main-100'
      )}
    >
      <div className="flex items-start gap-2.5">
        <Link
          href={`/challenge/${challenge.challengeId}`}
          className="flex min-w-0 flex-1 items-center gap-2.5"
        >
          <span
            className={cn(
              'inline-flex h-8 w-8 shrink-0 items-center justify-center',
              'rounded-full bg-white'
            )}
            style={{ color: tone }}
          >
            <CategoryIcon category={challenge.category} className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5">
              <span className="truncate text-[14px] font-bold text-gray-900">
                {challenge.title}
              </span>
              {isFree ? (
                <span
                  className={cn(
                    'shrink-0 rounded-full bg-gray-100 px-1.5 py-0.5',
                    'text-[10px] font-medium text-gray-500'
                  )}
                >
                  자유
                </span>
              ) : null}
            </span>
          </span>
        </Link>

        {/* 상태/액션 — 폭을 고정해 로딩→확정 전환 시 시프트를 막는다. */}
        <div className="flex shrink-0 justify-end">
          {isStatusLoading ? (
            <span className="skeleton-pulse h-7 w-[76px] rounded-full bg-gray-100" />
          ) : writtenToday ? (
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full',
                'bg-gray-100 px-2.5 py-1.5 text-[12px] font-medium text-gray-500'
              )}
            >
              <Check className="h-3.5 w-3.5" />
              완료
            </span>
          ) : (
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/diary/create?challengeId=${challenge.challengeId}`
                )
              }
              aria-label={`${challenge.title} 오늘 기록하기`}
              className={cn(
                'bg-brand inline-flex items-center rounded-full',
                'px-3 py-1.5 text-[12px] font-bold text-white',
                'cursor-pointer transition hover:brightness-105'
              )}
            >
              기록하기
            </button>
          )}
        </div>
      </div>

      <GoalsBlock goals={goals} goalsLoading={goalsLoading} isFree={isFree} />

      {/* 카테고리·기간은 보조 정보로 축소해 하단에 배치. */}
      <span className="mt-auto truncate text-[11px] text-gray-400">
        {getCategoryLabel(challenge.category)} · {remainingLabel}
      </span>
    </li>
  );
}

// 스켈레톤 카드 — 확정 전 그리드 높이/열을 그대로 예약한다.
function SkeletonCard(): React.ReactElement {
  return (
    <li className={cn(CARD_BASE, 'border-gray-200')}>
      <div className="flex items-center gap-2.5">
        <span className="skeleton-pulse h-8 w-8 shrink-0 rounded-full bg-gray-100" />
        <span className="skeleton-pulse h-3.5 w-1/2 rounded bg-gray-100" />
        <span className="skeleton-pulse ml-auto h-7 w-[76px] shrink-0 rounded-full bg-gray-100" />
      </div>
      <div className={cn(GOALS_BLOCK, 'flex flex-col gap-1.5')}>
        <span className="skeleton-pulse h-3 w-4/5 rounded bg-gray-100" />
        <span className="skeleton-pulse h-3 w-3/5 rounded bg-gray-100" />
        <span className="skeleton-pulse h-3 w-2/3 rounded bg-gray-100" />
      </div>
      <span className="skeleton-pulse mt-auto h-2.5 w-1/3 rounded bg-gray-100" />
    </li>
  );
}

export default function HomeTodayRecordSection({
  challenges,
  isAuthLoading,
}: HomeTodayRecordSectionProps): React.ReactElement {
  const router = useRouter();
  const ongoing = challenges.filter(
    (challenge) =>
      !isChallengeEndedOrArchived(challenge.endDate, challenge.participantCnt)
  );
  const { items, doneCount, pendingCount, isLoading, allResolved } =
    useTodayRecords(ongoing);

  // 참여 중인 진행 챌린지가 없을 때 — 탐색으로 유도한다.
  if (!isAuthLoading && ongoing.length === 0) {
    return (
      <section className="w-full">
        <SectionHeader size="sm" title="오늘의 기록" />
        <div
          className={cn(
            'mt-3 flex min-h-[140px] w-full flex-col items-center',
            'rounded-3 justify-center gap-3 border border-dashed',
            'border-main-200 p-6 text-center'
          )}
        >
          <p className="text-[14px] text-gray-600">
            아직 참여 중인 챌린지가 없어요.
          </p>
          <Button size="sm" onClick={() => router.push('/explore')}>
            챌린지 둘러보기
          </Button>
        </div>
      </section>
    );
  }

  // 인증/사이드바 로딩 중 — 진행 챌린지 수를 아직 모르므로 2행을 예약한다.
  if (isAuthLoading) {
    return (
      <section className="w-full">
        <SectionHeader size="sm" title="오늘의 기록" />
        <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </ul>
      </section>
    );
  }

  // 확정 후에만 미작성 우선으로 정렬(로딩 중엔 사이드바 순서 유지).
  const ordered = allResolved
    ? [...items].sort(
        (left, right) => Number(left.writtenToday) - Number(right.writtenToday)
      )
    : items;
  const allDone = allResolved && pendingCount === 0 && ongoing.length > 0;

  return (
    <section className="w-full">
      <SectionHeader
        size="sm"
        title="오늘의 기록"
        subtitle={
          isLoading
            ? undefined
            : allDone
              ? '오늘 기록을 모두 마쳤어요'
              : `오늘 ${pendingCount}개 챌린지가 기다리고 있어요`
        }
        actionLabel="전체보기 →"
        onActionClick={() => router.push('/mypage/challenge')}
      />

      {allDone ? (
        <div
          className={cn(
            'mt-3 flex flex-wrap items-center justify-between gap-2',
            'rounded-3 border-main-200 bg-main-100 border px-4 py-3',
            'data-fade-in'
          )}
        >
          <span className="text-[14px] font-medium text-gray-800">
            오늘 기록을 모두 마쳤어요 🎉 {doneCount}개 완료
          </span>
          <Link href="/explore" className="text-brand text-[13px] font-bold">
            새로운 챌린지 둘러보기 →
          </Link>
        </div>
      ) : null}

      <ul className="data-fade-in mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {ordered.map((item) => (
          <RecordCard
            key={item.challenge.challengeId}
            challenge={item.challenge}
            writtenToday={item.writtenToday}
            isStatusLoading={item.isLoading}
            goals={item.goals}
            goalsLoading={item.goalsLoading}
          />
        ))}
      </ul>
    </section>
  );
}
