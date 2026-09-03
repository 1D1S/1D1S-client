'use client';

import {
  Icon,
  MobileHeader,
  TextField,
  ToggleGroup,
  ToggleGroupItem,
} from '@1d1s/design-system';
import ChallengeCard from '@component/cards/ChallengeCard';
import EmptyState from '@component/EmptyState';
import { BoardScreenLayout } from '@component/layout/BoardScreenLayout';
import { ChallengeCardSkeletonGrid } from '@component/skeletons/ChallengeCardSkeleton';
import { CATEGORY_OPTIONS, CategoryIcon } from '@constants/categories';
import { useSignalPageReady } from '@module/hooks/useSignalPageReady';
import { cn } from '@module/utils/cn';
import { useMinimumLoading } from '@module/utils/useMinimumLoading';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';

import { ChallengeCompletedBadge } from '../../shared/components/ChallengeCompletedBadge';
import { FilterDisclosure } from '../components/FilterDisclosure';
import { useMyChallenges } from '../hooks/useChallengeQueries';
import type { MyChallengeItem } from '../type/challenge';
import { toChallengeCardProps } from '../utils/challengeCardProps';
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
    const hasLeft = item.participationStatus === 'LEAVE';

    return (
      <div className="relative">
        <ChallengeCard
          {...toChallengeCardProps(
            challenge,
            `/challenge/${challenge.challengeId}`
          )}
        />
        {/* 과거참여·완료 표시 — 카드 링크를 막지 않도록 pointer-events-none.
            둘 다 붙을 수 있어 한 행에 나란히 둔다. */}
        {hasLeft || item.completed ? (
          <div
            className={cn(
              'pointer-events-none absolute top-2 left-2 z-10 flex',
              'items-center gap-1'
            )}
          >
            {hasLeft ? (
              <span
                className={cn(
                  // 완료 딱지와 같은 규격(11px/px-2.5/py-1)으로 맞춰야
                  // 둘이 나란히 붙을 때 높이가 어긋나지 않는다.
                  'rounded-full bg-gray-900/80 px-2.5 py-1',
                  'text-[11px] font-extrabold whitespace-nowrap text-white'
                )}
              >
                참여종료
              </span>
            ) : null}
            {item.completed ? <ChallengeCompletedBadge /> : null}
          </div>
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
  useSignalPageReady('my_challenge', !showSkeleton);

  const [category, setCategory] = useState<string>('ALL');
  const [stateFilter, setStateFilter] = useState<StateFilter>('ALL');
  const [search, setSearch] = useState('');

  // 네이티브 툴바(앱)의 검색/필터. 챌린지 보드와 같은 이벤트 계약 —
  // 내 챌린지는 category(단일) + state(단일)만 쓴다. 웹 필터 블록은
  // 네이티브에서 data-native-hide 로 숨겨져 이 이벤트가 유일한 입력이다.
  useEffect(() => {
    const onSearch = (event: Event): void => {
      const detail = (event as CustomEvent<{ keyword?: string }>).detail;
      setSearch(detail?.keyword ?? '');
    };
    const onFilter = (event: Event): void => {
      const detail = (
        event as CustomEvent<{ category?: string; state?: StateFilter }>
      ).detail;
      if (!detail) {
        return;
      }
      if (detail.category) {
        setCategory(detail.category);
      }
      if (detail.state) {
        setStateFilter(detail.state);
      }
    };
    window.addEventListener('native:board_search', onSearch);
    window.addEventListener('native:board_filter', onFilter);
    return () => {
      window.removeEventListener('native:board_search', onSearch);
      window.removeEventListener('native:board_filter', onFilter);
    };
  }, []);

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
        // W15: 검색+필터를 상단 고정(챌린지 보드와 동일한 sticky 패턴).
        // 스크롤해도 필터가 따라 올라가지 않는다. bg-white 로 카드가 비쳐
        // 보이지 않게 하고, 좌우 -mx/px 로 컨테이너 패딩 경계까지 덮는다.
        <div
          data-native-hide
          className={cn(
            'sticky top-0 z-20 -mx-5 mt-4 flex flex-col gap-2.5 bg-white',
            'px-5 pt-1 pb-2 lg:-mx-8 lg:mt-6 lg:px-8'
          )}
        >
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
                    <CategoryIcon category={option.value} className="h-3 w-3" />
                  }
                >
                  {option.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          {/* 상태 필터 — 진행중 / 종료 / 참여종료. 기본 접힘(높이 축소). */}
          <FilterDisclosure>
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
          </FilterDisclosure>
        </div>
      ) : null}

      {/* 네이티브: 오버레이 툴바 높이만큼 첫 콘텐츠를 내린다. 웹: no-op. */}
      <div data-native-toolbar-offset>
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
      </div>
    </BoardScreenLayout>
  );
}
