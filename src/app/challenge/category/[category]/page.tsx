import { CATEGORY_OPTIONS, getCategoryLabel } from '@constants/categories';
import {
  BOARD_DEFAULT_STATUSES,
  fetchPublicChallengePage,
} from '@feature/challenge/board/api/publicChallengeList';
import { ChallengeBoardSkeleton } from '@feature/challenge/board/components/ChallengeBoardSkeleton';
import ChallengeListScreen from '@feature/challenge/board/screen/ChallengeListScreen';
import type { ChallengeCategory } from '@feature/challenge/board/type/challenge';
import { buildBreadcrumbJsonLd, JsonLd } from '@module/metadata/jsonLd';
import { buildPageMetadata } from '@module/metadata/seo';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import React, { Suspense } from 'react';

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

const SSR_CHALLENGE_COUNT = 12;

/** 서버 카테고리만 페이지가 된다 — 없는 값은 404 로 막아 색인을 더럽히지 않는다. */
function isKnownCategory(value: string): boolean {
  return CATEGORY_OPTIONS.some((option) => option.value === value);
}

export function generateStaticParams(): Array<{ category: string }> {
  return CATEGORY_OPTIONS.map((option) => ({ category: option.value }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  if (!isKnownCategory(category)) {
    return {};
  }
  const label = getCategoryLabel(category);
  return buildPageMetadata({
    title: `${label} 챌린지 | 1Day 1Streak`,
    description: `${label} 카테고리의 챌린지를 모아 봤습니다. 지금 모집 중인 챌린지에 참여해 매일의 기록을 시작하세요.`,
    path: `/challenge/category/${category}`,
    type: 'website',
  });
}

export default async function ChallengeCategoryPage({
  params,
}: CategoryPageProps): Promise<React.ReactElement> {
  const { category } = await params;
  if (!isKnownCategory(category)) {
    notFound();
  }

  const label = getCategoryLabel(category);
  const initialPage = await fetchPublicChallengePage({
    limit: SSR_CHALLENGE_COUNT,
    status: BOARD_DEFAULT_STATUSES,
    category,
  });

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: '챌린지', path: '/challenge' },
          { name: label, path: `/challenge/category/${category}` },
        ])}
      />
      <Suspense
        fallback={
          <ChallengeBoardSkeleton
            challenges={initialPage.items}
            title={`${label} 챌린지`}
            description={`${label} 카테고리의 챌린지를 모아 봤습니다.`}
          />
        }
      >
        <ChallengeListScreen
          initialPage={initialPage}
          title={`${label} 챌린지`}
          description={`${label} 카테고리의 챌린지를 모아 봤습니다.`}
          fixedCategory={category as ChallengeCategory}
        />
      </Suspense>
    </>
  );
}
