'use client';

import { Button, Icon, Text, TextField } from '@1d1s/design-system';
import ChallengeCard from '@component/cards/ChallengeCard';
import { LoginRequiredDialog } from '@component/LoginRequiredDialog';
import {
  getCategoryIcon,
  getCategoryLabel,
  getCategoryStripeTone,
} from '@constants/categories';
import { useIsLoggedIn } from '@feature/member/hooks/useIsLoggedIn';
import { cn } from '@module/utils/cn';
import { X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import ChallengeBoardFilters from '../components/ChallengeBoardFilters';
import { toCategoryParam } from '../consts/categoryFilters';
import { useChallengeList } from '../hooks/useChallengeQueries';
import type { ChallengeCategory } from '../type/challenge';
import {
  formatChallengeRemainingLabel,
  isChallengeEnded,
  isInfiniteChallengeEndDate,
} from '../utils/challengePeriod';

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
  const isLoggedIn = useIsLoggedIn();

  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [loginDialogDescription, setLoginDialogDescription] = useState(
    '로그인 후 이용할 수 있습니다.'
  );
  const [inputValue, setInputValue] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<ChallengeCategory>('ALL');

  const [prevIsLoginRequired, setPrevIsLoginRequired] = useState(false);
  if (isLoginRequired !== prevIsLoginRequired) {
    setPrevIsLoginRequired(isLoginRequired);
    if (isLoginRequired && !isLoggedIn) {
      setShowLoginDialog(true);
      setLoginDialogDescription(
        '챌린지 상세는 로그인 후 이용할 수 있습니다.'
      );
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

  const requireAuth = (description: string, action: () => void): void => {
    if (!isLoggedIn) {
      setLoginDialogDescription(description);
      setShowLoginDialog(true);
      return;
    }
    action();
  };

  const handleSearch = (): void => {
    setQuery(inputValue);
  };

  const handleClear = (): void => {
    setInputValue('');
    setQuery('');
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useChallengeList({
      limit: 12,
      keyword: query || undefined,
      category: toCategoryParam(category),
    });

  const { ref, inView } = useInViewObserver();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

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

      {/* 모바일 sticky 헤더 — 타이틀 + 새 챌린지 + 검색바 */}
      <div
        className={cn(
          'sticky top-0 z-20 border-b border-gray-100',
          'bg-white/95 px-5 pt-3.5 pb-3 backdrop-blur lg:hidden'
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
            onClick={() =>
              requireAuth(
                '챌린지 만들기는 로그인 후 이용할 수 있습니다.',
                () => router.push('/challenge/create')
              )
            }
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
            onClick={() =>
              requireAuth(
                '챌린지 만들기는 로그인 후 이용할 수 있습니다.',
                () => router.push('/challenge/create')
              )
            }
            className="self-start whitespace-nowrap lg:self-auto"
          >
            <span className="flex items-center gap-1">
              <Icon name="Plus" size={16} />
              새 챌린지
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

          <ChallengeBoardFilters
            selected={category}
            onSelect={(next) => setCategory(next)}
          />
        </div>

        <div className="mt-4 lg:mt-6">
          {challenges.length > 0 ? (
            <div
              className={cn(
                'grid gap-4',
                'grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4'
              )}
            >
              {challenges.map((challenge) => {
                const isInfinite = isInfiniteChallengeEndDate(
                  challenge.endDate
                );
                const ended = isChallengeEnded(challenge.endDate);
                const remainingLabel = formatChallengeRemainingLabel(
                  challenge.endDate,
                  isInfinite,
                  ended
                );

                return (
                  <ChallengeCard
                    key={challenge.challengeId}
                    title={challenge.title}
                    category={getCategoryLabel(challenge.category)}
                    categoryIcon={getCategoryIcon(challenge.category)}
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
                    onClick={() =>
                      requireAuth(
                        '챌린지 상세는 로그인 후 이용할 수 있습니다.',
                        () =>
                          router.push(`/challenge/${challenge.challengeId}`)
                      )
                    }
                  />
                );
              })}
            </div>
          ) : (
            <div className="flex w-full justify-center py-16">
              <Text size="body2" weight="medium" className="text-gray-500">
                조건에 맞는 챌린지가 없습니다.
              </Text>
            </div>
          )}

          <div
            ref={ref}
            className="mt-6 flex h-10 w-full items-center justify-center"
          >
            {isFetchingNextPage ? (
              <Text size="body2" className="text-gray-400">
                데이터를 불러오는 중...
              </Text>
            ) : !hasNextPage && challenges.length > 0 ? (
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
