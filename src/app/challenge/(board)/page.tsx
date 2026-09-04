import { fetchPublicChallengeSections } from '@feature/challenge/board/api/publicChallengeList';
import { ChallengeCategorySectionsSkeleton } from '@feature/challenge/board/components/ChallengeCategorySections';
import { CHALLENGE_SECTIONS } from '@feature/challenge/board/consts/challengeSections';
import ChallengeBoardScreen from '@feature/challenge/board/screen/ChallengeBoardScreen';
import { buildPageMetadata } from '@module/metadata/seo';
import type { Metadata } from 'next';
import React, { Suspense } from 'react';

export const metadata: Metadata = buildPageMetadata({
  title: '챌린지 | 1Day 1Streak',
  description:
    '개발·운동·독서·어학 등 카테고리별로 지금 모집 중인 챌린지를 찾아보세요.',
  path: '/challenge',
  type: 'website',
});

/**
 * 챌린지 탭 — 카테고리별 가로 레일 섹션.
 *
 * 줄 전부를 서버에서 읽어 초기 HTML 에 싣는다. 각 조회가 캐시되므로
 * 백엔드 요청은 한 시간에 열한 번이고, 그 대가로 초기 HTML 이 카테고리별로
 * 채워진다(예전 구조는 최신순 12장이 전부였다).
 *
 * Suspense 를 페이지 안에 두는 이유는 예전과 같다 — route-level loading.tsx
 * 는 /challenge/[id] 까지 감싸서, 상세를 새로고침할 때 보드 스켈레톤이
 * 먼저 뜬다.
 */
export default async function ChallengeListPage(): Promise<React.ReactElement> {
  const seeded = await fetchPublicChallengeSections();
  const byId = new Map(seeded.map((entry) => [entry.sectionId, entry.items]));
  // 빈 줄을 빼지 않는다 — 화면은 시드가 없는 줄을 "아직 안 온 줄"로 보고
  // 거기서 멈춘다(그 뒤가 전부 스켈레톤이 된다).
  const initialSections = CHALLENGE_SECTIONS.filter((section) =>
    byId.has(section.id)
  ).map((section) => ({ section, items: byId.get(section.id) ?? [] }));

  return (
    <Suspense fallback={<ChallengeCategorySectionsSkeleton />}>
      <ChallengeBoardScreen initialSections={initialSections} />
    </Suspense>
  );
}
