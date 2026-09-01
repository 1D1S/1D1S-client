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
import { CHALLENGE_SEARCH_PARAM } from '@constants/challengeSearch';
import { useIsLoggedIn } from '@feature/member/hooks/useIsLoggedIn';
import { useInfiniteScroll } from '@module/hooks/useInfiniteScroll';
import { useSignalAppReady } from '@module/hooks/useSignalAppReady';
import { useSignalPageReady } from '@module/hooks/useSignalPageReady';
import { cn } from '@module/utils/cn';
import { X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { BOARD_DEFAULT_STATUSES } from '../api/publicChallengeList';
import { ChallengeBoardFilters } from '../components/ChallengeBoardFilters';
import { toCategoryParam } from '../consts/categoryFilters';
import { useChallengeList } from '../hooks/useChallengeQueries';
import type {
  ChallengeCategory,
  ChallengeListItem,
  ChallengeListResponse,
  ChallengeStatus,
  ChallengeTypeFilter,
} from '../type/challenge';
import { resolveChallengeCardStatus } from '../utils/challengePeriod';

interface ChallengeBoardCardItemProps {
  challenge: ChallengeListItem;
  /** 상세 링크. 상세는 비로그인도 열람 가능하므로 항상 지정된다. */
  href: string;
}

// 카드 매핑에서 인라인 람다·파생 계산을 제거해 React.memo(ChallengeCard) 가
// 실제로 재렌더를 건너뛸 수 있도록 한다.
const ChallengeBoardCardItem = React.memo(
  ({ challenge, href }: ChallengeBoardCardItemProps): React.ReactElement => {
    const { status, isInfinite, isEnded, remainingLabel } =
      resolveChallengeCardStatus(challenge);

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
        isEnded={isEnded}
        status={status}
        isPhotoRequired={challenge.photoRequired}
        isOfficial={challenge.challengeType === 'OFFICIAL'}
        participants={challenge.randomParticipants}
        href={href}
      />
    );
  }
);
ChallengeBoardCardItem.displayName = 'ChallengeBoardCardItem';

interface ChallengeBoardScreenProps {
  /**
   * 서버가 기본 필터(모집중·진행중)로 미리 읽어 둔 첫 페이지.
   * 필터·검색이 기본 상태일 때만 쓴다 — 조건이 다르면 다른 목록이 잠깐 보인다.
   */
  initialPage?: ChallengeListResponse;
}

export default function ChallengeBoardScreen({
  initialPage,
}: ChallengeBoardScreenProps = {}): React.ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isLoggedIn = useIsLoggedIn();

  // 검색어는 URL(?keyword=)이 원본이다. 결과가 주소를 가져야 공유·뒤로가기가
  // 되고, WebSite 구조화 데이터의 SearchAction 이 가리킬 대상이 생긴다.
  const urlKeyword = searchParams.get(CHALLENGE_SEARCH_PARAM) ?? '';

  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [loginDialogDescription, setLoginDialogDescription] =
    useState('로그인 후 이용할 수 있습니다.');
  const [inputValue, setInputValue] = useState(urlKeyword);
  // 입력 중 매 글자마다 URL 을 갈아끼우면 라우터 왕복이 붙으므로, 확정된
  // 검색어(query)만 URL 과 맞춘다.
  const [query, setQuery] = useState(urlKeyword);
  const [category, setCategory] = useState<ChallengeCategory>('ALL');
  const [challengeType, setChallengeType] = useState<
    ChallengeTypeFilter | 'ALL'
  >('ALL');
  // 기본 진입 시 종료된 챌린지는 숨긴다 — 모집중/진행중만 선택된 상태.
  const [statuses, setStatuses] = useState<ChallengeStatus[]>([
    'UPCOMING',
    'ONGOING',
  ]);

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

  // 뒤로가기·딥링크·SearchAction 진입으로 URL 이 바뀌면 화면을 맞춘다.
  // 우리가 replace 한 직후엔 같은 값이라 no-op.
  useEffect(() => {
    setInputValue(urlKeyword);
    setQuery(urlKeyword);
  }, [urlKeyword]);

  const syncKeywordToUrl = useCallback(
    (keyword: string): void => {
      const params = new URLSearchParams(searchParams.toString());
      if (keyword) {
        params.set(CHALLENGE_SEARCH_PARAM, keyword);
      } else {
        params.delete(CHALLENGE_SEARCH_PARAM);
      }
      const queryString = params.toString();
      // 검색할 때마다 history 를 쌓으면 뒤로가기가 검색어를 거슬러 올라가야
      // 목록을 벗어난다. replace 로 주소만 갱신한다.
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams]
  );

  const handleSearch = useCallback((): void => {
    setQuery(inputValue);
    syncKeywordToUrl(inputValue);
    scrollListToTop();
  }, [inputValue, scrollListToTop, syncKeywordToUrl]);

  const handleClear = useCallback((): void => {
    setInputValue('');
    setQuery('');
    syncKeywordToUrl('');
    scrollListToTop();
  }, [scrollListToTop, syncKeywordToUrl]);

  // 네이티브 쉘의 검색 다이얼로그. 웹 검색 필드는 네이티브에서 숨겨지므로
  // (data-native-hide) 이 이벤트가 유일한 검색 입력 경로다. 웹과 같은
  // 경로를 타도록 URL 까지 맞춘다.
  useEffect(() => {
    const listener = (event: Event): void => {
      const detail = (event as CustomEvent<{ keyword?: string }>).detail;
      const keyword = detail?.keyword ?? '';
      setInputValue(keyword);
      setQuery(keyword);
      syncKeywordToUrl(keyword);
      scrollListToTop();
    };
    window.addEventListener('native:board_search', listener);
    return () => window.removeEventListener('native:board_search', listener);
  }, [scrollListToTop, syncKeywordToUrl]);

  // 네이티브 툴바의 필터 선택. 검색과 같은 방식 — 카테고리/종류/상태를
  // 한 번에 받아 로컬 상태에 반영한다.
  useEffect(() => {
    const listener = (event: Event): void => {
      const detail = (
        event as CustomEvent<{
          category?: ChallengeCategory;
          challengeType?: ChallengeTypeFilter | 'ALL';
          statuses?: ChallengeStatus[];
        }>
      ).detail;
      if (!detail) {
        return;
      }
      if (detail.category) {
        setCategory(detail.category);
      }
      if (detail.challengeType) {
        setChallengeType(detail.challengeType);
      }
      if (Array.isArray(detail.statuses)) {
        setStatuses(detail.statuses);
      }
      scrollListToTop();
    };
    window.addEventListener('native:board_filter', listener);
    return () => window.removeEventListener('native:board_filter', listener);
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

  // SSR 첫 페이지는 "서버가 읽어 온 조건 그대로"일 때만 쓸 수 있다.
  // 사용자가 필터나 검색어를 건드린 순간부터는 다른 목록이므로 넘기지 않는다.
  const isDefaultView =
    !query &&
    category === 'ALL' &&
    challengeType === 'ALL' &&
    statuses.length === BOARD_DEFAULT_STATUSES.length &&
    BOARD_DEFAULT_STATUSES.every((status) => statuses.includes(status));
  const seededPage = isDefaultView ? initialPage : undefined;

  // 미선택 필터는 undefined 로 넘겨 요청에서 키 자체가 빠지게 한다
  // (빈 값 전송 시 서버 enum 변환 400). status 빈 배열도 동일.
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useChallengeList(
      {
        limit: 12,
        keyword: query || undefined,
        category: toCategoryParam(category),
        challengeType: challengeType === 'ALL' ? undefined : challengeType,
        status: statuses.length > 0 ? statuses : undefined,
      },
      seededPage
    );

  const { ref } = useInfiniteScroll({
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    fetchNextPage,
  });

  const challenges = useMemo(
    () => data?.pages?.flatMap((page) => page?.items ?? []) ?? [],
    [data]
  );

  // 스플래시 dismiss 신호: 챌린지 목록 첫 페이지가 로드(성공/에러 확정)된 뒤
  // 1회 발화 — 스켈레톤 그리드가 아니라 실제 목록이 렌더된 시점.
  useSignalAppReady(!isLoading);
  useSignalPageReady('challenge_board', !isLoading);

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
        // 모바일 sticky 헤더 — 타이틀 + 새 챌린지 + 검색바 + 필터.
        //
        // 네이티브 쉘이 대체하는 건 **타이틀과 새 챌린지 버튼뿐**이다
        // (AppBoardHeader + FAB). 검색 입력과 ChallengeBoardFilters 는
        // 네이티브에 대응물이 없다. 예전엔 data-native-keep 을 빼서 글로벌
        // sticky 차단 룰이 이 래퍼를 통째로 가렸는데, 그러면 같은 래퍼 안에
        // 있는 검색과 카테고리/종류/상태 필터까지 전부 사라진다 — 앱에서만
        // 챌린지를 검색하거나 거를 수 없었다.
        //
        // 그래서 래퍼는 살리고(data-native-keep), 실제로 중복인 타이틀 행만
        // 가린다. 새 챌린지 버튼은 이미 자체 data-native-hide 가 있다.
        // 네이티브 쉘은 검색과 필터를 전부 네이티브 툴바로 그린다 — 이
        // 래퍼는 글로벌 sticky 차단 룰이 통째로 숨긴다 (keep 마커 없음).
        <div
          className={cn(
            'sticky top-0 z-20 border-b border-gray-100',
            'bg-white px-5 pt-[calc(0.875rem+env(safe-area-inset-top))] pb-3',
            'lg:hidden'
          )}
        >
          <div
            data-native-hide
            className="mb-3 flex items-center justify-between"
          >
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
          {/* 네이티브에서는 헤더의 검색 버튼(다이얼로그)이 이 필드를
              대신한다 — native:board_search 이벤트로 같은 상태에 꽂힌다. */}
          <div data-native-hide>
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
        onOpenChange={setShowLoginDialog}
        description={loginDialogDescription}
      />

      <div className="native-flush-top mt-2 flex flex-col gap-4 lg:mt-6">
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

      <div data-native-toolbar-offset className="mt-4 lg:mt-6">
        {isLoading && challenges.length === 0 ? (
          <ChallengeCardSkeletonGrid count={8} className="gap-4" />
        ) : challenges.length > 0 ? (
          <div
            className={cn(
              'grid gap-4',
              'xs:grid-cols-2 grid-cols-1 sm:grid-cols-3',
              // data-fade-in 은 opacity 0.35 에서 시작한다. 스켈레톤 뒤엔
              // 등장 연출이지만, SSR 목록이 이미 보이는 상태에서 걸면
              // 화면이 어두워졌다 밝아지는 깜빡임이 된다.
              !seededPage && 'data-fade-in'
            )}
          >
            {challenges.map((challenge) => (
              <ChallengeBoardCardItem
                key={challenge.challengeId}
                challenge={challenge}
                href={`/challenge/${challenge.challengeId}`}
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
