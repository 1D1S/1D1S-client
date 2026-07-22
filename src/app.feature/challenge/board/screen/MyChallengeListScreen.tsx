'use client';

import {
  Icon,
  MobileHeader,
  TextField,
  ToggleGroup,
  ToggleGroupItem,
} from '@1d1s/design-system';
import ChallengeCard, {
  type ChallengeCardGoalType,
} from '@component/cards/ChallengeCard';
import EmptyState from '@component/EmptyState';
import { BoardScreenLayout } from '@component/layout/BoardScreenLayout';
import { ChallengeCardSkeletonGrid } from '@component/skeletons/ChallengeCardSkeleton';
import {
  CATEGORY_OPTIONS,
  CategoryIcon,
  getCategoryLabel,
  getCategoryStripeTone,
} from '@constants/categories';
import { cn } from '@module/utils/cn';
import { useMinimumLoading } from '@module/utils/useMinimumLoading';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';

import { useMyChallenges } from '../hooks/useChallengeQueries';
import type { MyChallengeItem } from '../type/challenge';
import {
  formatChallengeRemainingLabel,
  isChallengeEndedOrArchived,
  isInfiniteChallengeEndDate,
} from '../utils/challengePeriod';
import {
  getMyChallengeState,
  type MyChallengeState,
  sortMyChallenges,
} from '../utils/myChallengeSort';

// 상태 필터 — 진행중 / 종료 / 참여종료(LEAVE). 챌린지 보드 필터와 동일한
// ToggleGroup 칩 패턴을 쓰되, 내 챌린지 특성(참여종료)에 맞춘 항목이다.
type StateFilter = 'ALL' | MyChallengeState;

const STATE_OPTIONS: ReadonlyArray<{ value: StateFilter; label: string }> = [
  { value: 'ALL', label: '전체' },
  { value: 'ONGOING', label: '진행중' },
  { value: 'ENDED', label: '종료' },
  { value: 'LEFT', label: '참여종료' },
];

const FILTER_ROW_CLASS = cn(
  'scrollbar-hide -mx-5 -my-2 flex items-center gap-1.5',
  'overflow-x-auto px-5 py-2 sm:mx-0 sm:my-0 sm:flex-wrap',
  'sm:overflow-visible sm:px-0 sm:py-0'
);

const GROUP_LABEL_CLASS = 'shrink-0 text-[11px] font-bold text-gray-400';

interface MyChallengeCardItemProps {
  item: MyChallengeItem;
}

// 응답이 { participationStatus, challenge } 중첩 구조라 challenge 를 펴서 매핑.
const MyChallengeCardItem = React.memo(
  ({ item }: MyChallengeCardItemProps): React.ReactElement => {
    const { challenge } = item;
    const isInfinite = isInfiniteChallengeEndDate(challenge.endDate);
    const ended = isChallengeEndedOrArchived(
      challenge.endDate,
      challenge.participantCnt,
      challenge.challengeType
    );
    const remainingLabel = formatChallengeRemainingLabel(
      challenge.endDate,
      isInfinite,
      ended
    );
    const hasLeft = item.participationStatus === 'LEAVE';

    return (
      <div className="relative">
        <ChallengeCard
          title={challenge.title}
          category={getCategoryLabel(challenge.category)}
          categoryIcon={
            <CategoryIcon category={challenge.category} className="h-3 w-3" />
          }
          stripeTone={getCategoryStripeTone(challenge.category)}
          imageUrl={challenge.thumbnailImage ?? undefined}
          currentParticipantCount={challenge.participantCnt}
          maxParticipantCount={challenge.maxParticipantCnt}
          remainingLabel={remainingLabel}
          startDate={challenge.startDate}
          endDate={challenge.endDate}
          isInfinite={isInfinite}
          goalType={challenge.goalType as ChallengeCardGoalType}
          isGroup={challenge.participationType === 'GROUP'}
          isEnded={ended}
          isOfficial={challenge.challengeType === 'OFFICIAL'}
          participants={challenge.randomParticipants}
          href={`/challenge/${challenge.challengeId}`}
        />
        {/* 과거참여 표시 — 카드 링크를 막지 않도록 pointer-events-none */}
        {hasLeft ? (
          <span
            className={cn(
              'pointer-events-none absolute top-2 left-2 z-10 rounded-full',
              'bg-gray-900/80 px-2 py-0.5 text-[10px] font-extrabold',
              'text-white'
            )}
          >
            참여종료
          </span>
        ) : null}
      </div>
    );
  }
);
MyChallengeCardItem.displayName = 'MyChallengeCardItem';

/**
 * 내 챌린지 전체보기.
 * GET /challenges/my?scope=ALL 로 참여 이력 전체(진행중·종료·과거참여)를
 * 받아, 검색 + 카테고리/상태 필터 + 정렬(진행중 우선 → 날짜)을 적용한다.
 * 마이페이지 요약(useMyPage.challengeList = 진행중 프리뷰)과는 별개다.
 */
export function MyChallengeListScreen(): React.ReactElement {
  const router = useRouter();
  // scope=ALL 로 전체를 받아 상태 필터는 클라에서 처리한다(탭 전환마다
  // 재요청하지 않아 체감이 빠르고, 정렬도 한 번에 적용된다).
  const { data, isLoading } = useMyChallenges('ALL');
  const showSkeleton = useMinimumLoading(isLoading);

  const [category, setCategory] = useState<string>('ALL');
  const [stateFilter, setStateFilter] = useState<StateFilter>('ALL');
  const [search, setSearch] = useState('');

  const items = useMemo(() => data ?? [], [data]);
  const hasAnyChallenge = items.length > 0;

  // 검색 + 카테고리 + 상태 필터 후 정렬(진행중 우선 → 날짜 최신순).
  const visibleItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = items.filter((item) => {
      const { challenge } = item;
      const categoryOk = category === 'ALL' || challenge.category === category;
      const stateOk =
        stateFilter === 'ALL' || getMyChallengeState(item) === stateFilter;
      const searchOk =
        query === '' || challenge.title.toLowerCase().includes(query);
      return categoryOk && stateOk && searchOk;
    });
    return sortMyChallenges(filtered);
  }, [items, category, stateFilter, search]);

  const hasResults = visibleItems.length > 0;

  return (
    <BoardScreenLayout
      title="내 챌린지 전체 보기"
      description="참여했던 챌린지 전체입니다. 검색·필터로 좁혀 보세요."
      mobileHeader={
        <MobileHeader
          title="내 챌린지 전체 보기"
          onBack={() => router.push('/mypage')}
        />
      }
    >
      {!showSkeleton && hasAnyChallenge ? (
        <div className="mt-4 flex flex-col gap-2.5 lg:mt-6">
          <div className="w-full max-w-[480px]">
            <TextField
              className="w-full"
              placeholder="내 챌린지 검색"
              value={search}
              iconLeft={<Icon name="Search" size={15} />}
              iconRight={
                search ? (
                  <button
                    type="button"
                    aria-label="검색어 지우기"
                    onClick={() => setSearch('')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : undefined
              }
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {/* 카테고리 필터 */}
          <div className={FILTER_ROW_CLASS}>
            <span className={GROUP_LABEL_CLASS}>카테고리</span>
            <ToggleGroup
              type="single"
              value={category}
              aria-label="카테고리"
              onValueChange={(value) => {
                if (value) {
                  setCategory(value);
                }
              }}
              className="flex shrink-0 items-center gap-1.5"
            >
              <ToggleGroupItem value="ALL" size="sm" shape="rounded">
                전체
              </ToggleGroupItem>
              {CATEGORY_OPTIONS.map((option) => (
                <ToggleGroupItem
                  key={option.value}
                  value={option.value}
                  size="sm"
                  shape="rounded"
                  icon={
                    <CategoryIcon
                      category={option.value}
                      className="h-3 w-3"
                    />
                  }
                >
                  {option.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          {/* 상태 필터 — 진행중 / 종료 / 참여종료 */}
          <div className={FILTER_ROW_CLASS}>
            <span className={GROUP_LABEL_CLASS}>상태</span>
            <ToggleGroup
              type="single"
              value={stateFilter}
              aria-label="참여 상태"
              onValueChange={(value) => {
                if (value) {
                  setStateFilter(value as StateFilter);
                }
              }}
              className="flex shrink-0 items-center gap-1.5"
            >
              {STATE_OPTIONS.map((option) => (
                <ToggleGroupItem
                  key={option.value}
                  value={option.value}
                  size="sm"
                  shape="rounded"
                >
                  {option.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>
      ) : null}

      {showSkeleton ? (
        <ChallengeCardSkeletonGrid
          count={8}
          className="data-fade-in mt-6 gap-4"
        />
      ) : null}

      {!showSkeleton && hasResults ? (
        <div
          className={cn(
            'data-fade-in mt-6 grid gap-4',
            'xs:grid-cols-2 grid-cols-1 sm:grid-cols-3'
          )}
        >
          {visibleItems.map((item) => (
            <MyChallengeCardItem
              key={item.challenge.challengeId}
              item={item}
            />
          ))}
        </div>
      ) : null}

      {/* 필터 결과 없음(참여 이력은 있으나 조건에 안 맞음) */}
      {!showSkeleton && hasAnyChallenge && !hasResults ? (
        <EmptyState
          variant="challenge"
          title="조건에 맞는 챌린지가 없어요"
          description="검색어나 필터를 바꿔 보세요"
          className="mt-10"
        />
      ) : null}

      {/* 참여 이력 자체가 없음 */}
      {!showSkeleton && !hasAnyChallenge ? (
        <EmptyState
          variant="challenge"
          title="참여한 챌린지가 없어요"
          className="mt-10"
        />
      ) : null}
    </BoardScreenLayout>
  );
}
