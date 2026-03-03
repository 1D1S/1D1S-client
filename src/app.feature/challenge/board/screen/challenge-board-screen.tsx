'use client';

import {
  Button,
  ChallengeCard,
  Icon,
  Text,
  TextField,
  Toggle,
} from '@1d1s/design-system';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { useChallengeList } from '../hooks/use-challenge-queries';
import { ChallengeCategory, ChallengeListItem } from '../type/challenge';

const CHALLENGE_BOARD_CATEGORY_FILTERS: Array<{
  key: ChallengeCategory;
  label: string;
  icon?: string;
}> = [
  { key: 'ALL', label: '전체' },
  { key: 'DEV', label: '개발', icon: '💻' },
  { key: 'EXERCISE', label: '운동', icon: '💪' },
  { key: 'STUDY', label: '공부', icon: '📚' },
  { key: 'HEALTH', label: '건강', icon: '🥗' },
  { key: 'HOBBY', label: '취미', icon: '🎨' },
  { key: 'OTHER', label: '기타' },
];

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
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] =
    useState<ChallengeCategory>('ALL');
  // const [currentPage, setCurrentPage] = useState(1);

  // useChallengeList 무한 스크롤 데이터
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useChallengeList({
      limit: 10,
      keyword: query || undefined,
    });

  const { ref, inView } = useInViewObserver();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const isOngoingChallenge = (challenge: ChallengeListItem): boolean =>
    challenge.participantCnt >= challenge.maxParticipantCnt;

  const isEndedChallenge = (challenge: ChallengeListItem): boolean => {
    const today = new Date();
    const endDate = new Date(challenge.endDate);
    return today > endDate;
  };

  // InfiniteQuery로 가져온 pages 배열을 flatten하여 일반 Challenge 리스트로 만듦;
  // ChallengeItem[]에서 keyword 기반 필터링
  const filteredChallenges = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    console.log(data);
    const flattenChallenges =
      data?.pages?.flatMap((page) => page?.data?.items ?? []) ?? [];

    return flattenChallenges.filter((challenge) => {
      const categoryMatched =
        selectedCategory === 'ALL' || challenge.category === selectedCategory;
      // others 카테고리 분기 처리 필요함.
      if (!categoryMatched) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }
      return (
        challenge.title.toLowerCase().includes(normalizedQuery) ||
        // 개별 챌린지의 description에 대한 검색이 필요하면 추가해야 함.
        // challenge.description.toLowerCase().includes(normalizedQuery) ||
        challenge.challengeType.toLowerCase().includes(normalizedQuery) ||
        challenge.category.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [query, selectedCategory, data]);

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
    <div className="flex min-h-screen w-full flex-col p-4">
      <section className="rounded-4 w-full px-1 pb-6">
        <div className="flex flex-col gap-2">
          <Text size="display1" weight="bold" className="text-gray-900">
            전체 챌린지
          </Text>
          <Text size="body1" weight="regular" className="text-gray-600">
            새로운 습관을 만들고 함께 성장할 챌린지를 찾아보세요.
          </Text>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="w-full max-w-[460px]">
            <TextField
              variant="search"
              className="w-full"
              placeholder="챌린지 검색 (이름, 설명)"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                // setCurrentPage(1);
              }}
            />
          </div>
          <Button
            size="medium"
            onClick={() => router.push('/challenge/create')}
            className="whitespace-nowrap"
          >
            <span className="flex items-center gap-1">
              <Icon name="Plus" size={16} />새 챌린지 생성
            </span>
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
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
        </div>

        {isLoading && (
          <div className="mt-8 flex w-full justify-center py-10">
            <Text size="body1" weight="medium" className="text-gray-500">
              데이터를 불러오는 중...
            </Text>
          </div>
        )}

        <div className="challenge-grid-container mt-8">
          <div className="challenge-card-grid grid grid-cols-1 gap-4">
            {filteredChallenges.map((challenge) => (
              <div key={challenge.challengeId} className="min-w-0">
                <ChallengeCard
                  challengeTitle={challenge.title}
                  challengeType={formatChallengeType(challenge.challengeType)}
                  challengeCategory={challenge.category}
                  currentUserCount={challenge.participantCnt}
                  maxUserCount={challenge.maxParticipantCnt}
                  startDate={challenge.startDate}
                  endDate={challenge.endDate}
                  isOngoing={isOngoingChallenge(challenge)}
                  isEnded={isEndedChallenge(challenge)}
                  className="h-full"
                  onClick={() =>
                    router.push(`/challenge/${challenge.challengeId}`)
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

        {filteredChallenges.length === 0 && !isLoading ? (
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
