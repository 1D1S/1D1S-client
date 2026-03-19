'use client';

import {
  Button,
  ChallengeCard,
  Icon,
  Text,
  TextField,
} from '@1d1s/design-system';
import { LoginRequiredDialog } from '@component/login-required-dialog';
import { getCategoryLabel } from '@constants/categories';
import { authStorage } from '@module/utils/auth';
import { X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { useChallengeList } from '../hooks/use-challenge-queries';
import { isInfiniteChallengeEndDate } from '../utils/challenge-period';

// async function fetchChallengeList() {
//   const response = await apiClient('/')
// }

function useInViewObserver(): {
  ref: React.RefObject<HTMLDivElement | null>;
  inView: boolean;
} {
  const ref = useRef<HTMLDivElement>(null);
  const [observedInView, setObservedInView] = useState(false);
  const isIntersectionObserverUnsupported =
    typeof window !== 'undefined' &&
    typeof IntersectionObserver === 'undefined';

  useEffect(() => {
    const target = ref.current;

    if (!target || typeof window === 'undefined') {
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      setObservedInView(entry.isIntersecting);
    });

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, []);

  const inView = isIntersectionObserverUnsupported ? true : observedInView;

  return { ref, inView };
}

export default function ChallengeBoardScreen(): React.ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isLoginRequired = searchParams.get('loginRequired') === 'true';
  const [showLoginDialog, setShowLoginDialog] = useState(isLoginRequired);
  const [loginDialogDescription, setLoginDialogDescription] = useState(
    isLoginRequired
      ? '챌린지 상세는 로그인 후 이용할 수 있습니다.'
      : '로그인 후 이용할 수 있습니다.'
  );
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (!isLoginRequired) {
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    params.delete('loginRequired');
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [query, setQuery] = useState('');

  const requireAuth = (description: string, action: () => void): void => {
    if (!authStorage.hasTokens()) {
      setLoginDialogDescription(description);
      setShowLoginDialog(true);
      return;
    }
    action();
  };
  // const [selectedCategory, setSelectedCategory] = useState<ChallengeCategory>('ALL');

  const handleSearch = (): void => {
    setQuery(inputValue);
  };

  const handleClear = (): void => {
    setInputValue('');
    setQuery('');
  };
  // const [currentPage, setCurrentPage] = useState(1);

  // useChallengeList 무한 스크롤 데이터
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useChallengeList({
      limit: 10,
      keyword: query || undefined,
      category: undefined,
    });

  const { ref, inView } = useInViewObserver();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // InfiniteQuery로 가져온 pages 배열을 flatten
  const filteredChallenges = useMemo(
    () => data?.pages?.flatMap((page) => page?.data?.items ?? []) ?? [],
    [data]
  );

  const formatChallengeType = (challengeTypeResponse: string): string =>
    ({ FIXED: '고정 목표', FLEXIBLE: '개인 목표' })[
      String(challengeTypeResponse)
    ] ?? '기타';

  // 페이지네이션 우선 제거

  // const totalPages = Math.max(
  //   1,
  //   Math.ceil(filteredChallenges.length / CHALLENGE_BOARD_ITEMS_PER_PAGE)
  // );
  // const safeCurrentPage = Math.min(currentPage, totalPages);

  // const paginatedChallenges = useMemo(() => {
  //   const start = (safeCurrentPage - 1) * CHALLENGE_BOARD_ITEMS_PER_PAGE;
  //   return filteredChallenges.slice(
  //     start,
  //     start + CHALLENGE_BOARD_ITEMS_PER_PAGE
  //   );
  // }, [filteredChallenges, safeCurrentPage]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-white p-4">
      <LoginRequiredDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        description={loginDialogDescription}
      />
      <section className="rounded-3 w-full bg-white p-2">
        <div className="flex items-start justify-between border-b border-gray-200 pb-5">
          <div className="flex flex-col gap-2">
            <Text size="display1" weight="bold" className="text-gray-900">
              전체 챌린지
            </Text>
            <Text size="body1" weight="regular" className="text-gray-600">
              새로운 습관을 만들고 함께 성장할 챌린지를 찾아보세요.
            </Text>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex w-full max-w-[560px] gap-2">
            <div className="relative w-full">
              <TextField
                variant="search"
                className="w-full pr-8"
                placeholder="챌린지 검색 (이름, 설명)"
                value={inputValue}
                onChange={(event) => {
                  setInputValue(event.target.value);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
              {inputValue ? (
                <button
                  type="button"
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={handleClear}
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
            <Button
              size="medium"
              onClick={handleSearch}
              className="h-10 whitespace-nowrap"
            >
              검색
            </Button>
          </div>
          <Button
            size="medium"
            onClick={() =>
              requireAuth('챌린지 생성은 로그인 후 이용할 수 있습니다.', () =>
                router.push('/challenge/create')
              )
            }
            className="whitespace-nowrap"
          >
            <span className="flex items-center gap-1">
              <Icon name="Plus" size={16} />새 챌린지 생성
            </span>
          </Button>
        </div>

        {/* <div className="mt-4 flex flex-wrap gap-2">
          {CHALLENGE_BOARD_CATEGORY_FILTERS.map((filter) => (
            <Toggle
              key={filter.key}
              shape="rounded"
              icon={filter.icon}
              pressed={selectedCategory === filter.key}
              onPressedChange={(pressed) => {
                if (pressed) {
                  setSelectedCategory(filter.key);
                  // setCurrentPage(1);
                }
              }}
              className="h-10 px-4"
            >
              {filter.label}
            </Toggle>
          ))}
        </div> */}

        <div className="challenge-grid-container mt-8">
          <div className="challenge-card-grid grid grid-cols-1 gap-4">
            {filteredChallenges.map((challenge) => (
              <div key={challenge.challengeId} className="min-w-0">
                <ChallengeCard
                  challengeTitle={challenge.title}
                  challengeType={formatChallengeType(challenge.challengeType)}
                  challengeCategory={getCategoryLabel(challenge.category)}
                  currentUserCount={challenge.participantCnt}
                  maxUserCount={challenge.maxParticipantCnt}
                  startDate={challenge.startDate}
                  endDate={challenge.endDate}
                  isInfiniteChallenge={isInfiniteChallengeEndDate(
                    challenge.endDate
                  )}
                  isOngoing={/*challenge.status === 'closingSoon'*/ true}
                  isEnded={/*challenge.status === 'ended'*/ false}
                  className="h-full"
                  onClick={() =>
                    requireAuth(
                      '챌린지 상세는 로그인 후 이용할 수 있습니다.',
                      () => router.push(`/challenge/${challenge.challengeId}`)
                    )
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <div
          ref={ref}
          className="mt-4 flex h-10 w-full items-center justify-center"
        >
          {isFetchingNextPage ? (
            <Text size="body2" className="text-gray-400">
              데이터를 불러오는 중...
            </Text>
          ) : hasNextPage ? (
            <div />
          ) : filteredChallenges.length > 0 ? (
            <Text size="body2" className="text-gray-400">
              마지막 챌린지입니다.
            </Text>
          ) : null}
        </div>

        {filteredChallenges.length === 0 ? (
          <div className="mt-8 flex w-full justify-center py-10">
            <Text size="body1" weight="medium" className="text-gray-500">
              조건에 맞는 챌린지가 없습니다.
            </Text>
          </div>
        ) : null}

        {/* 페이지네이션 우선 제거 */}
        {/* <div className="mt-10 flex items-center justify-center">
          <Pagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div> */}
      </section>
    </div>
  );
}
