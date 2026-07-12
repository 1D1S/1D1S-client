import { ChallengeDetailSkeleton } from '@component/skeletons/ChallengeDetailSkeleton';
import { ChallengeDetailScreen } from '@feature/challenge/detail/screen/ChallengeDetailScreen';
import {
  buildResourceMetadata,
  fetchOfficialChallenge,
  SITE_DESCRIPTION,
  SITE_TITLE,
} from '@module/metadata/seo';
import type { Metadata } from 'next';
import React, { Suspense } from 'react';

interface ChallengeDetailProps {
  params: Promise<{ id: string }>;
}

/**
 * 공식(OFFICIAL) 챌린지만 전용 OG 를 채운다. 개별 챌린지 상세는 비인증 조회가
 * 막혀 있어(400 AUTH-002) 목록(/challenges/offset?challengeType=OFFICIAL)에서
 * id 로 찾는다. 일반(비공식)·비공개·조회 실패는 빈 객체를 반환해 루트 기본
 * 메타(기본 OG)로 폴백한다. 배너/썸네일이 있으면 OG 이미지로, 없으면 기본
 * 이미지. 목록엔 설명이 없어 사이트 설명을 쓴다.
 */
export async function generateMetadata({
  params,
}: ChallengeDetailProps): Promise<Metadata> {
  const { id } = await params;
  const official = await fetchOfficialChallenge(id);
  if (!official) {
    return {};
  }

  return buildResourceMetadata({
    title: `${official.title} | ${SITE_TITLE}`,
    description: SITE_DESCRIPTION,
    imageUrl: official.thumbnailImage,
  });
}

/**
 * 상세 데이터는 클라이언트 React Query(useChallengeDetail)로 이관했다.
 * 인증 가드는 `src/app.module/middleware/auth.ts` 의 미들웨어가 동일 로직
 * (access 토큰 또는 세션 힌트)으로 처리하므로 페이지 레벨 `hasServerSession`
 * 게이트는 제거했다. 만료 힌트만 있는 경우는 ChallengeDetailScreen 의
 * useIsLoggedIn + LoginRequiredDialog 가 가린다.
 *
 * 서버에서 쿠키를 읽지 않으므로 route 가 dynamic 강제에서 풀려 `<Link>`
 * prefetch 로 셸이 미리 채워지고, 목록↔상세 왕복 시 QueryClient 캐시가
 * 즉시 서빙된다.
 */
export default async function ChallengeDetail({
  params,
}: ChallengeDetailProps): Promise<React.ReactElement> {
  const { id } = await params;
  // ChallengeDetailScreen 의 useSearchParams(?tab) CSR bailout 경계.
  return (
    <Suspense fallback={<ChallengeDetailSkeleton />}>
      <ChallengeDetailScreen id={id} />
    </Suspense>
  );
}
