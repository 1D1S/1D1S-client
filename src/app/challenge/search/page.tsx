import { ChallengeBoardSkeleton } from '@feature/challenge/board/components/ChallengeBoardSkeleton';
import ChallengeListScreen from '@feature/challenge/board/screen/ChallengeListScreen';
import { buildPageMetadata } from '@module/metadata/seo';
import type { Metadata } from 'next';
import React, { Suspense } from 'react';

/**
 * 챌린지 검색.
 *
 * 결과가 검색어에 따라 매번 다르므로 초기 HTML 에 실을 목록이 없다
 * (SSR 시드 없음). 색인 대상도 아니다 — 빈 검색 결과 페이지가 잔뜩
 * 색인되면 사이트 품질만 떨어진다.
 */
export const metadata: Metadata = {
  ...buildPageMetadata({
    title: '챌린지 검색 | 1Day 1Streak',
    description: '원하는 챌린지를 검색해 보세요.',
    path: '/challenge/search',
    type: 'website',
  }),
  robots: { index: false, follow: true },
};

export default function ChallengeSearchPage(): React.ReactElement {
  return (
    <Suspense
      fallback={
        <ChallengeBoardSkeleton
          title="챌린지 검색"
          description="제목으로 챌린지를 찾아보세요."
        />
      }
    >
      <ChallengeListScreen
        title="챌린지 검색"
        description="제목으로 챌린지를 찾아보세요."
        autoFocusSearch
      />
    </Suspense>
  );
}
