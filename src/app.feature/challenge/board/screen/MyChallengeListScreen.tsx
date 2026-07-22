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
import { useMyPage } from '@feature/member/hooks/useMemberQueries';
import type { MyPageChallenge } from '@feature/member/type/member';
import { cn } from '@module/utils/cn';
import { useMinimumLoading } from '@module/utils/useMinimumLoading';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';

import {
  formatChallengeRemainingLabel,
  isChallengeEndedOrArchived,
  isInfiniteChallengeEndDate,
} from '../utils/challengePeriod';
import { sortMyChallenges } from '../utils/myChallengeSort';

interface MyChallengeCardItemProps {
  challenge: MyPageChallenge;
}

// MyPageActiveChallenges 와 동일한 매핑. React.memo(ChallengeCard) 가
// 재렌더를 건너뛰도록 파생 계산을 컴포넌트로 분리한다.
const MyChallengeCardItem = React.memo(
  ({ challenge }: MyChallengeCardItemProps): React.ReactElement => {
    const isInfinite = isInfiniteChallengeEndDate(challenge.endDate);
    const ended = isChallengeEndedOrArchived(
      challenge.endDate,
      challenge.participantCnt
    );
    const remainingLabel = formatChallengeRemainingLabel(
      challenge.endDate,
      isInfinite,
      ended
    );

    return (
      <ChallengeCard
        title={challenge.title}
        category={getCategoryLabel(challenge.category)}
        categoryIcon={
          <CategoryIcon category={challenge.category} className="h-3 w-3" />
        }
        stripeTone={getCategoryStripeTone(challenge.category)}
        imageUrl={challenge.thumbnailImage}
        currentParticipantCount={challenge.participantCnt}
        maxParticipantCount={challenge.maxParticipantCnt}
        remainingLabel={remainingLabel}
        startDate={challenge.startDate}
        endDate={challenge.endDate}
        isInfinite={isInfinite}
        goalType={challenge.goalType as ChallengeCardGoalType}
        isGroup={challenge.participationType === 'GROUP'}
        isEnded={ended}
        isPhotoRequired={challenge.photoRequired}
        participants={challenge.randomParticipants}
        href={`/challenge/${challenge.challengeId}`}
      />
    );
  }
);
MyChallengeCardItem.displayName = 'MyChallengeCardItem';

// 카테고리 필터 칩 — 챌린지 보드(ChallengeBoardFilters)와 동일 패턴.
function CategoryFilterRow({
  category,
  onChange,
}: {
  category: string;
  onChange(value: string): void;
}): React.ReactElement {
  return (
    <div
      className={cn(
        'scrollbar-hide -mx-5 -my-2 flex items-center gap-1.5',
        'overflow-x-auto px-5 py-2 sm:mx-0 sm:my-0 sm:flex-wrap',
        'sm:overflow-visible sm:px-0 sm:py-0'
      )}
    >
      <ToggleGroup
        type="single"
        value={category}
        aria-label="카테고리"
        onValueChange={(value) => {
          if (value) {
            onChange(value);
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
            icon={<CategoryIcon category={option.value} className="h-3 w-3" />}
          >
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}

// ponytail: /member/my-page 의 challengeList 를 그대로 사용한다.
// ⚠️ 서버 getMemberChallenge 가 (HOST/PARTICIPANT) + (진행중 기간) 으로
// 하드코딩 필터링해, 종료·과거참여 챌린지는 아직 응답에 없다(서버 변경 필요).
// 검색/카테고리 필터/정렬(진행중 우선)은 클라에서 결합 동작하며, 종료·과거
// 챌린지가 응답에 포함되면 정렬이 그대로 진행중 우선으로 처리한다.
export function MyChallengeListScreen(): React.ReactElement {
  const router = useRouter();
  const { data, isLoading } = useMyPage();
  const showSkeleton = useMinimumLoading(isLoading);

  const [category, setCategory] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const challenges = useMemo(() => data?.challengeList ?? [], [data]);
  const hasAnyChallenge = challenges.length > 0;

  // 카테고리·검색 필터 후 정렬(진행중 우선 + 날짜). 모두 클라이언트 계산.
  const visibleChallenges = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = challenges.filter((challenge) => {
      const categoryOk = category === 'ALL' || challenge.category === category;
      const searchOk =
        query === '' || challenge.title.toLowerCase().includes(query);
      return categoryOk && searchOk;
    });
    return sortMyChallenges(filtered);
  }, [challenges, category, search]);

  const hasResults = visibleChallenges.length > 0;

  return (
    <BoardScreenLayout
      title="내 챌린지 전체 보기"
      description="참여 중인 챌린지입니다. 검색·카테고리로 좁혀 보세요."
      mobileHeader={
        <MobileHeader
          title="내 챌린지 전체 보기"
          onBack={() => router.push('/mypage')}
        />
      }
    >
      {/* 검색 + 카테고리 필터 — 챌린지 보드와 동일 패턴 */}
      {!showSkeleton && hasAnyChallenge ? (
        <div className="mt-4 flex flex-col gap-3 lg:mt-6">
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
          <CategoryFilterRow category={category} onChange={setCategory} />
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
          {visibleChallenges.map((challenge) => (
            <MyChallengeCardItem
              key={challenge.challengeId}
              challenge={challenge}
            />
          ))}
        </div>
      ) : null}

      {/* 필터 결과 없음(챌린지는 있으나 조건에 안 맞음) */}
      {!showSkeleton && hasAnyChallenge && !hasResults ? (
        <EmptyState
          variant="challenge"
          title="조건에 맞는 챌린지가 없어요"
          description="검색어나 카테고리를 바꿔 보세요"
          className="mt-10"
        />
      ) : null}

      {/* 참여 챌린지 자체가 없음 */}
      {!showSkeleton && !hasAnyChallenge ? (
        <EmptyState
          variant="challenge"
          title="참여 중인 챌린지가 없어요"
          className="mt-10"
        />
      ) : null}
    </BoardScreenLayout>
  );
}
