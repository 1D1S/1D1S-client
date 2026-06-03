'use client';

import { Button, Icon, Text, TextField } from '@1d1s/design-system';
import ChallengeCard from '@component/cards/ChallengeCard';
import { LoginRequiredDialog } from '@component/LoginRequiredDialog';
import {
  ChallengeCardSkeleton,
  ChallengeCardSkeletonGrid,
} from '@component/skeletons/ChallengeCardSkeleton';
import {
  CategoryIcon,
  getCategoryLabel,
  getCategoryStripeTone,
} from '@constants/categories';
import { useIsLoggedIn } from '@feature/member/hooks/useIsLoggedIn';
import { useInfiniteScroll } from '@module/hooks/useInfiniteScroll';
import { cn } from '@module/utils/cn';
import { X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { toCategoryParam } from '../consts/categoryFilters';
import { useChallengeList } from '../hooks/useChallengeQueries';
import type { ChallengeCategory, ChallengeListItem } from '../type/challenge';
import {
  formatChallengeRemainingLabel,
  isChallengeEndedOrArchived,
  isInfiniteChallengeEndDate,
} from '../utils/challengePeriod';

interface ChallengeBoardCardItemProps {
  challenge: ChallengeListItem;
  onCardClick(challengeId: number): void;
}

// 카드 매핑에서 인라인 람다·파생 계산을 제거해 React.memo(ChallengeCard) 가
// 실제로 재렌더를 건너뛸 수 있도록 한다.
const ChallengeBoardCardItem = React.memo(
  ({
    challenge,
    onCardClick,
  }: ChallengeBoardCardItemProps): React.ReactElement => {
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

    const handleClick = useCallback(() => {
      onCardClick(challenge.challengeId);
    }, [onCardClick, challenge.challengeId]);

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
        goalType={challenge.goalType}
        isGroup={challenge.participationType === 'GROUP'}
        isEnded={ended}
        participants={challenge.randomParticipants}
        onClick={handleClick}
      />
    );
  }
);
ChallengeBoardCardItem.displayName = 'ChallengeBoardCardItem';

export default function ChallengeBoardScreen(): React.ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isLoginRequired = searchParams.get('loginRequired') === 'true';
  const isLoggedIn = useIsLoggedIn();

  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [loginDialogDescription, setLoginDialogDescription] =
    useState('로그인 후 이용할 수 있습니다.');
  const [inputValue, setInputValue] = useState('');
  const [query, setQuery] = useState('');
  const [category] = useState<ChallengeCategory>('ALL');

  const [prevIsLoginRequired, setPrevIsLoginRequired] = useState(false);
  if (isLoginRequired !== prevIsLoginRequired) {
    setPrevIsLoginRequired(isLoginRequired);
    if (isLoginRequired && !isLoggedIn) {
      setShowLoginDialog(true);
      setLoginDialogDescription('챌린지 상세는 로그인 후 이용할 수 있습니다.');
    }
  }

  useEffect(() => {
    if (!isLoginRequired) {
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    params.delete('loginRequired');
    const next = params.toString();
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  }, [isLoginRequired, pathname, router, searchParams]);

  const requireAuth = useCallback(
    (description: string, action: () => void): void => {
      if (!isLoggedIn) {
        setLoginDialogDescription(description);
        setShowLoginDialog(true);
        return;
      }
      action();
    },
    [isLoggedIn]
  );

  const handleSearch = useCallback((): void => {
    setQuery(inputValue);
  }, [inputValue]);

  const handleClear = useCallback((): void => {
    setInputValue('');
    setQuery('');
  }, []);

  const handleCreateChallenge = useCallback((): void => {
    requireAuth('챌린지 만들기는 로그인 후 이용할 수 있습니다.', () =>
      router.push('/challenge/create')
    );
  }, [requireAuth, router]);

  const handleChallengeCardClick = useCallback(
    (challengeId: number): void => {
      requireAuth('챌린지 상세는 로그인 후 이용할 수 있습니다.', () =>
        router.push(`/challenge/${challengeId}`)
      );
    },
    [requireAuth, router]
  );

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useChallengeList({
      limit: 12,
      keyword: query || undefined,
      category: toCategoryParam(category),
    });

  const { ref } = useInfiniteScroll({
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    fetchNextPage,
  });

  const challenges = useMemo(
    () => data?.pages?.flatMap((page) => page?.data?.items ?? []) ?? [],
    [data]
  );

  return (
    <div className="w-full">
      <LoginRequiredDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        description={loginDialogDescription}
      />

      {/* 모바일 sticky 헤더 — 타이틀 + 새 챌린지 + 검색바.
          네이티브 쉘에서는 AppTopNav + sliver AppBar 가 동일 영역을
          책임지고, FAB 가 "챌린지 추가" 액션을 제공하므로 이 헤더는
          글로벌 sticky 차단 룰로 함께 가린다 (data-native-keep 제거). */}
      <div
        className={cn(
          'sticky top-0 z-20 border-b border-gray-100',
          'bg-white/95 px-5 pt-[calc(0.875rem+env(safe-area-inset-top))] pb-3',
          'backdrop-blur lg:hidden'
        )}
      >
        <div className="mb-3 flex items-center justify-between">
          <Text
            as="h1"
            size="heading1"
            weight="extrabold"
            className="tracking-[-0.5px] text-gray-900"
          >
            챌린지
          </Text>
          <button
            type="button"
            onClick={handleCreateChallenge}
            data-native-hide
            className={cn(
              'bg-main-800 inline-flex items-center gap-1 rounded-full',
              'px-3 py-1.5 text-[11px] font-extrabold text-white',
              'transition hover:brightness-105'
            )}
          >
            <Icon name="Plus" size={12} />새 챌린지
          </button>
        </div>
        <TextField
          className="w-full"
          placeholder="챌린지 검색"
          value={inputValue}
          iconLeft={<Icon name="Search" size={15} />}
          iconRight={
            inputValue ? (
              <button
                type="button"
                aria-label="검색어 지우기"
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            ) : undefined
          }
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              handleSearch();
            }
          }}
        />
      </div>

      <div className="mx-auto w-full max-w-[1200px] px-5 py-5 lg:px-8 lg:py-10">
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
              챌린지 보드
            </Text>
            <Text size="body2" weight="regular" className="text-gray-500">
              새로운 습관을 만들고 함께 성장할 챌린지를 찾아보세요.
            </Text>
          </div>
          <Button
            size="medium"
            onClick={handleCreateChallenge}
            className="self-start whitespace-nowrap lg:self-auto"
          >
            <span className="flex items-center gap-1">
              <Icon name="Plus" size={16} />새 챌린지
            </span>
          </Button>
        </header>

        <div className="mt-2 flex flex-col gap-4 lg:mt-6">
          {/* 데스크탑 검색바 — 모바일은 sticky 헤더에 있음 */}
          <div className="hidden w-full max-w-[480px] gap-2 lg:flex">
            <div className="w-full">
              <TextField
                className="w-full"
                placeholder="챌린지 검색"
                value={inputValue}
                iconLeft={<Icon name="Search" size={15} />}
                iconRight={
                  inputValue ? (
                    <button
                      type="button"
                      aria-label="검색어 지우기"
                      onClick={handleClear}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  ) : undefined
                }
                onChange={(event) => setInputValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
            </div>
            <Button
              size="medium"
              onClick={handleSearch}
              className="h-10 whitespace-nowrap"
            >
              검색
            </Button>
          </div>

        </div>

        <div className="mt-4 lg:mt-6">
          {isLoading && challenges.length === 0 ? (
            <ChallengeCardSkeletonGrid count={8} className="gap-4" />
          ) : challenges.length > 0 ? (
            <div
              className={cn(
                'data-fade-in grid gap-4',
                'grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4'
              )}
            >
              {challenges.map((challenge) => (
                <ChallengeBoardCardItem
                  key={challenge.challengeId}
                  challenge={challenge}
                  onCardClick={handleChallengeCardClick}
                />
              ))}
            </div>
          ) : (
            <div className="flex w-full justify-center py-16">
              <Text size="body2" weight="medium" className="text-gray-500">
                조건에 맞는 챌린지가 없습니다.
              </Text>
            </div>
          )}

          {isFetchingNextPage ? (
            <div
              className={cn(
                'mt-4 grid gap-4',
                'grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4'
              )}
            >
              {Array.from({ length: 4 }).map((_, index) => (
                <ChallengeCardSkeleton key={index} />
              ))}
            </div>
          ) : null}

          <div
            ref={ref}
            className="mt-6 flex h-10 w-full items-center justify-center"
          >
            {isFetchingNextPage ? null : !hasNextPage &&
              challenges.length > 0 ? (
              <Text size="body2" className="text-gray-400">
                마지막 챌린지입니다.
              </Text>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
