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

// 행 높이를 균일하게 고정한다. 미작성/완료 재정렬은 이 고정 높이 컨테이너
// 안에서만 순서를 바꾸므로 아래 섹션으로 시프트가 전파되지 않는다.
const ROW_BASE = 'flex min-h-[76px] items-center gap-3 rounded-3 border p-3';

// 유한 챌린지의 경과 진행률(%). 무기한/유효하지 않은 기간은 null.
function computeProgress(startDate: string, endDate: string): number | null {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
    return null;
  }
  const ratio = (Date.now() - start) / (end - start);
  return Math.min(100, Math.max(0, Math.round(ratio * 100)));
}

interface RecordRowProps {
  challenge: SidebarChallenge;
  writtenToday: boolean;
  isStatusLoading: boolean;
}

function RecordRow({
  challenge,
  writtenToday,
  isStatusLoading,
}: RecordRowProps): React.ReactElement {
  const router = useRouter();
  const tone = getCategoryStripeTone(challenge.category);
  const isInfinite = isInfiniteChallengeEndDate(challenge.endDate);
  const remainingLabel = formatChallengeRemainingLabel(
    challenge.endDate,
    isInfinite,
    false
  );
  const progress = isInfinite
    ? null
    : computeProgress(challenge.startDate, challenge.endDate);

  return (
    <li
      className={cn(
        ROW_BASE,
        writtenToday
          ? 'border-gray-200 bg-white'
          : 'border-main-200 bg-main-100'
      )}
    >
      <Link
        href={`/challenge/${challenge.challengeId}`}
        className="flex min-w-0 flex-1 items-center gap-3"
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
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="truncate text-[14px] font-medium text-gray-900">
            {challenge.title}
          </span>
          <span className="flex items-center gap-2">
            {progress !== null ? (
              <span className="h-1 w-16 overflow-hidden rounded-full bg-gray-100">
                <span
                  className="bg-main-500 block h-full"
                  style={{ width: `${progress}%` }}
                />
              </span>
            ) : null}
            <span className="text-[11px] text-gray-500">
              {getCategoryLabel(challenge.category)} · {remainingLabel}
            </span>
          </span>
        </span>
      </Link>

      {/* 상태/액션 — 폭을 고정해 로딩→확정 전환 시 시프트를 막는다. */}
      <div className="flex w-[92px] shrink-0 justify-end">
        {isStatusLoading ? (
          <span className="skeleton-pulse h-7 w-[84px] rounded-full bg-gray-100" />
        ) : writtenToday ? (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full',
              'bg-gray-100 px-3 py-1.5 text-[12px] font-medium text-gray-500'
            )}
          >
            <Check className="h-3.5 w-3.5" />
            완료
          </span>
        ) : (
          <button
            type="button"
            onClick={() =>
              router.push(`/diary/create?challengeId=${challenge.challengeId}`)
            }
            aria-label={`${challenge.title} 오늘 기록하기`}
            className={cn(
              'bg-brand inline-flex items-center rounded-full',
              'px-3.5 py-1.5 text-[12px] font-bold text-white',
              'cursor-pointer transition hover:brightness-105'
            )}
          >
            기록하기
          </button>
        )}
      </div>
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

  // 인증/사이드바 로딩 중 — 진행 챌린지 수를 아직 모르므로 3행을 예약한다.
  if (isAuthLoading) {
    return (
      <section className="w-full">
        <SectionHeader size="sm" title="오늘의 기록" />
        <ul className="mt-3 flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <li key={index} className={cn(ROW_BASE, 'border-gray-200')}>
              <span className="skeleton-pulse h-8 w-8 shrink-0 rounded-full bg-gray-100" />
              <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="skeleton-pulse h-3.5 w-2/3 rounded bg-gray-100" />
                <span className="skeleton-pulse h-3 w-1/3 rounded bg-gray-100" />
              </span>
              <span className="skeleton-pulse h-7 w-[84px] shrink-0 rounded-full bg-gray-100" />
            </li>
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
          <Link
            href="/explore"
            className="text-brand text-[13px] font-bold"
          >
            새로운 챌린지 둘러보기 →
          </Link>
        </div>
      ) : null}

      <ul className="data-fade-in mt-3 flex flex-col gap-2">
        {ordered.map((item) => (
          <RecordRow
            key={item.challenge.challengeId}
            challenge={item.challenge}
            writtenToday={item.writtenToday}
            isStatusLoading={item.isLoading}
          />
        ))}
      </ul>
    </section>
  );
}
