'use client';

import { Button, Icon, Text, TextField } from '@1d1s/design-system';
import ChallengeCard from '@component/cards/ChallengeCard';
import EmptyState from '@component/EmptyState';
import { BoardScreenLayout } from '@component/layout/BoardScreenLayout';
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
import { useLoginRequiredParam } from '@module/hooks/useLoginRequiredParam';
import { cn } from '@module/utils/cn';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useMemo, useState } from 'react';

import { ChallengeBoardFilters } from '../components/ChallengeBoardFilters';
import { toCategoryParam } from '../consts/categoryFilters';
import { useChallengeList } from '../hooks/useChallengeQueries';
import type {
  ChallengeCategory,
  ChallengeListItem,
  ChallengeStatus,
  ChallengeTypeFilter,
} from '../type/challenge';
import {
  formatChallengeRemainingLabel,
  isChallengeEndedOrArchived,
  isInfiniteChallengeEndDate,
} from '../utils/challengePeriod';

interface ChallengeBoardCardItemProps {
  challenge: ChallengeListItem;
  /** 로그인 시 상세 링크. 비로그인 시 undefined + onRequireLogin 사용. */
  href?: string;
  onRequireLogin(): void;
}

// 카드 매핑에서 인라인 람다·파생 계산을 제거해 React.memo(ChallengeCard) 가
// 실제로 재렌더를 건너뛸 수 있도록 한다.
const ChallengeBoardCardItem = React.memo(
  ({
    challenge,
    href,
    onRequireLogin,
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
        isPhotoRequired={challenge.photoRequired}
        isOfficial={challenge.challengeType === 'OFFICIAL'}
        participants={challenge.randomParticipants}
        href={href}
        onClick={onRequireLogin}
      />
    );
  }
);
ChallengeBoardCardItem.displayName = 'ChallengeBoardCardItem';

export default function ChallengeBoardScreen(): React.ReactElement {
  const router = useRouter();
  const { isLoginRequired, returnTo } = useLoginRequiredParam();
  const isLoggedIn = useIsLoggedIn();

  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [loginDialogDescription, setLoginDialogDescription] =
    useState('로그인 후 이용할 수 있습니다.');
  const [inputValue, setInputValue] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<ChallengeCategory>('ALL');
  const [challengeType, setChallengeType] = useState<
    ChallengeTypeFilter | 'ALL'
  >('ALL');
  // 기본 진입 시 종료된 챌린지는 숨긴다 — 모집중/진행중만 선택된 상태.
  const [statuses, setStatuses] = useState<ChallengeStatus[]>([
    'UPCOMING',
    'ONGOING',
  ]);

  // 상세 → 목록 바운스 시 원래 가려던 상세 경로. 로그인 후 그리로 복귀한다.
  const [loginReturnTo, setLoginReturnTo] = useState<string | null>(null);
  const [prevIsLoginRequired, setPrevIsLoginRequired] = useState(false);
  if (isLoginRequired !== prevIsLoginRequired) {
    setPrevIsLoginRequired(isLoginRequired);
    if (isLoginRequired && !isLoggedIn) {
      setShowLoginDialog(true);
      setLoginDialogDescription('챌린지 상세는 로그인 후 이용할 수 있습니다.');
      setLoginReturnTo(returnTo);
    }
  }

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

  // 필터/검색이 바뀌면 결과 목록이 처음부터 보이도록 즉시 최상단으로.
  // (라우트 이동 시의 ScrollToTop 과 동일하게 instant 스크롤)
  const scrollListToTop = useCallback((): void => {
    window.scrollTo(0, 0);
  }, []);

  const handleSearch = useCallback((): void => {
    setQuery(inputValue);
    scrollListToTop();
  }, [inputValue, scrollListToTop]);

  const handleClear = useCallback((): void => {
    setInputValue('');
    setQuery('');
    scrollListToTop();
  }, [scrollListToTop]);

  const handleCategoryChange = useCallback(
    (value: ChallengeCategory): void => {
      setCategory(value);
      scrollListToTop();
    },
    [scrollListToTop]
  );

  const handleChallengeTypeChange = useCallback(
    (value: ChallengeTypeFilter | 'ALL'): void => {
      setChallengeType(value);
      scrollListToTop();
    },
    [scrollListToTop]
  );

  const handleStatusesChange = useCallback(
    (value: ChallengeStatus[]): void => {
      setStatuses(value);
      scrollListToTop();
    },
    [scrollListToTop]
  );

  const handleCreateChallenge = useCallback((): void => {
    requireAuth('챌린지 만들기는 로그인 후 이용할 수 있습니다.', () =>
      router.push('/challenge/create')
    );
  }, [requireAuth, router]);

  // 로그인 시 카드 자체가 Link(prefetch)로 이동하므로 비로그인 유도만 남는다.
  const handleCardRequireLogin = useCallback((): void => {
    setLoginDialogDescription('챌린지 상세는 로그인 후 이용할 수 있습니다.');
    setShowLoginDialog(true);
  }, []);

  // 미선택 필터는 undefined 로 넘겨 요청에서 키 자체가 빠지게 한다
  // (빈 값 전송 시 서버 enum 변환 400). status 빈 배열도 동일.
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useChallengeList({
      limit: 12,
      keyword: query || undefined,
      category: toCategoryParam(category),
      challengeType: challengeType === 'ALL' ? undefined : challengeType,
      status: statuses.length > 0 ? statuses : undefined,
    });

  const { ref } = useInfiniteScroll({
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    fetchNextPage,
  });

  const challenges = useMemo(
    () => data?.pages?.flatMap((page) => page?.items ?? []) ?? [],
    [data]
  );

  return (
    <BoardScreenLayout
      outerClassName="w-full"
      title="챌린지 보드"
      description="새로운 습관을 만들고 함께 성장할 챌린지를 찾아보세요."
      action={
        <Button
          size="md"
          onClick={handleCreateChallenge}
          className="self-start whitespace-nowrap lg:self-auto"
        >
          <span className="flex items-center gap-1">
            <Icon name="Plus" size={16} />새 챌린지
          </span>
        </Button>
      }
      mobileHeader={
        // 모바일 sticky 헤더 — 타이틀 + 새 챌린지 + 검색바.
        // 네이티브 쉘에서는 AppTopNav + sliver AppBar 가 동일 영역을
        // 책임지고, FAB 가 "챌린지 추가" 액션을 제공하므로 이 헤더는
        // 글로벌 sticky 차단 룰로 함께 가린다 (data-native-keep 제거).
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
                // bg-brand ≡ bg-main-800 — 의미 토큰으로 통일
                'bg-brand inline-flex items-center gap-1 rounded-full',
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
          <ChallengeBoardFilters
            category={category}
            onCategoryChange={handleCategoryChange}
            challengeType={challengeType}
            onChallengeTypeChange={handleChallengeTypeChange}
            statuses={statuses}
            onStatusesChange={handleStatusesChange}
            className="mt-3"
          />
        </div>
      }
    >
      <LoginRequiredDialog
        open={showLoginDialog}
        onOpenChange={(open) => {
          setShowLoginDialog(open);
          if (!open) {
            setLoginReturnTo(null);
          }
        }}
        description={loginDialogDescription}
        returnTo={loginReturnTo}
      />

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
            size="md"
            onClick={handleSearch}
            className="h-10 whitespace-nowrap"
          >
            검색
          </Button>
        </div>

        {/* 필터 — 모바일(<lg)은 sticky 헤더 쪽에서 렌더 */}
        <ChallengeBoardFilters
          category={category}
          onCategoryChange={handleCategoryChange}
          challengeType={challengeType}
          onChallengeTypeChange={handleChallengeTypeChange}
          statuses={statuses}
          onStatusesChange={handleStatusesChange}
          className="hidden lg:flex"
        />
      </div>

      <div className="mt-4 lg:mt-6">
        {isLoading && challenges.length === 0 ? (
          <ChallengeCardSkeletonGrid count={8} className="gap-4" />
        ) : challenges.length > 0 ? (
          <div
            className={cn(
              'data-fade-in grid gap-4',
              'xs:grid-cols-2 grid-cols-1 sm:grid-cols-3'
            )}
          >
            {challenges.map((challenge) => (
              <ChallengeBoardCardItem
                key={challenge.challengeId}
                challenge={challenge}
                href={
                  isLoggedIn ? `/challenge/${challenge.challengeId}` : undefined
                }
                onRequireLogin={handleCardRequireLogin}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            variant="challenge"
            title="조건에 맞는 챌린지가 없어요"
            description="필터를 바꾸거나 검색어를 다시 입력해 보세요"
            className="py-16"
          />
        )}

        {isFetchingNextPage ? (
          <div
            className={cn(
              'mt-4 grid gap-4',
              'xs:grid-cols-2 grid-cols-1 sm:grid-cols-3'
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
          {isFetchingNextPage ? null : !hasNextPage && challenges.length > 0 ? (
            <Text size="body2" className="text-gray-400">
              마지막 챌린지입니다.
            </Text>
          ) : null}
        </div>
      </div>
    </BoardScreenLayout>
  );
}
