'use client';

import { Button, Icon, Text } from '@1d1s/design-system';
import EmptyState from '@component/EmptyState';
import { BoardScreenLayout } from '@component/layout/BoardScreenLayout';
import { LoginRequiredDialog } from '@component/LoginRequiredDialog';
import { CATEGORY_OPTIONS } from '@constants/categories';
import { CHALLENGE_SEARCH_PARAM } from '@constants/challengeSearch';
import { useIsLoggedIn } from '@feature/member/hooks/useIsLoggedIn';
import { useSignalAppReady } from '@module/hooks/useSignalAppReady';
import { useSignalPageReady } from '@module/hooks/useSignalPageReady';
import { cn } from '@module/utils/cn';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';

import {
  ChallengeCategoryChips,
  ChallengeCategorySections,
  ChallengeCategorySectionsSkeleton,
} from '../components/ChallengeCategorySections';
import type { ChallengeSectionResult } from '../hooks/useCategorySections';
import { useCategorySections } from '../hooks/useCategorySections';

interface ChallengeBoardScreenProps {
  /** 서버가 미리 읽어 둔 앞쪽 줄들. 나머지는 하이드레이션 후 채워진다. */
  initialSections?: ChallengeSectionResult[];
}

/**
 * 챌린지 탭 홈 — **카테고리별 가로 레일 섹션**.
 *
 * 예전엔 필터칩 + 전체 챌린지 무한스크롤 그리드였다. 그러면 첫 화면이
 * 최신순 열두 장뿐이라 어떤 종류의 챌린지가 있는지가 안 보인다. 이제
 * 카테고리마다 다섯 장씩 세우고, 더 보려면 '전체보기'로 그 카테고리의
 * 목록(ChallengeListScreen)으로 간다.
 *
 * 필터·검색·무한스크롤은 사라진 것이 아니라 옮겨 갔다:
 *   /challenge/category/{category} · /challenge/search
 */
export default function ChallengeBoardScreen({
  initialSections,
}: ChallengeBoardScreenProps = {}): React.ReactElement {
  const router = useRouter();
  const isLoggedIn = useIsLoggedIn();
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const { sections, isLoading, isError } = useCategorySections(initialSections);

  const handleCreateChallenge = useCallback((): void => {
    if (!isLoggedIn) {
      setShowLoginDialog(true);
      return;
    }
    router.push('/challenge/create');
  }, [isLoggedIn, router]);

  // 네이티브 쉘의 검색 다이얼로그. 이 화면에는 목록이 없으므로 검색
  // 화면으로 넘긴다 — 앱에서 검색이 먹통이 되면 안 된다.
  useEffect(() => {
    const listener = (event: Event): void => {
      const detail = (event as CustomEvent<{ keyword?: string }>).detail;
      const keyword = detail?.keyword ?? '';
      const query = keyword
        ? `?${CHALLENGE_SEARCH_PARAM}=${encodeURIComponent(keyword)}`
        : '';
      router.push(`/challenge/search${query}`);
    };
    window.addEventListener('native:board_search', listener);
    return () => window.removeEventListener('native:board_search', listener);
  }, [router]);

  // 네이티브 툴바의 필터. 이 화면에는 필터가 없으니 카테고리 목록으로
  // 넘겨 준다 — 고른 조건이 그냥 사라지면 고장으로 읽힌다.
  useEffect(() => {
    const listener = (event: Event): void => {
      const detail = (event as CustomEvent<{ category?: string }>).detail;
      if (detail?.category && detail.category !== 'ALL') {
        router.push(`/challenge/category/${detail.category}`);
      }
    };
    window.addEventListener('native:board_filter', listener);
    return () => window.removeEventListener('native:board_filter', listener);
  }, [router]);

  useSignalAppReady(!isLoading);
  useSignalPageReady('challenge_board', !isLoading);

  return (
    <BoardScreenLayout
      outerClassName="w-full"
      // 레일이 화면 끝까지 흘러야 해서 목록 자체는 좌우 여백이 없다.
      // 여백은 줄마다(섹션 헤더·레일) 준다.
      contentClassName="px-0 lg:px-8"
      title="챌린지"
      description="카테고리별로 지금 모집 중인 챌린지를 둘러보세요."
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
        <div
          className={cn(
            'sticky top-0 z-20 floating-header border-gray-100',
            'bg-white px-4 pb-3',
            'lg:hidden'
          )}
        >
          <div
            data-native-hide
            className="flex items-center justify-between"
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
                'bg-brand inline-flex items-center gap-1 rounded-full',
                'px-3 py-1.5 text-[11px] font-extrabold text-white',
                'transition hover:brightness-105'
              )}
            >
              <Icon name="Plus" size={12} />새 챌린지
            </button>
          </div>
        </div>
      }
    >
      <LoginRequiredDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        description="챌린지 만들기는 로그인 후 이용할 수 있습니다."
      />

      <div data-native-toolbar-offset className="native-flush-top mt-4 lg:mt-6">
        {isLoading ? (
          <ChallengeCategorySectionsSkeleton />
        ) : sections.length > 0 ? (
          <ChallengeCategorySections
            sections={sections}
            header={<ChallengeCategoryChips categories={CATEGORY_OPTIONS} />}
          />
        ) : (
          <EmptyState
            variant="challenge"
            title={
              isError ? '챌린지를 불러오지 못했어요' : '표시할 챌린지가 없어요'
            }
            description={
              isError
                ? '잠시 후 다시 시도해 주세요'
                : '첫 챌린지를 만들어 보세요'
            }
            className="py-16"
          />
        )}
      </div>
    </BoardScreenLayout>
  );
}
