import { ChallengeDetailSkeleton } from '@component/skeletons/ChallengeDetailSkeleton';
import { ChallengeDetailResponse } from '@feature/challenge/board/type/challenge';
import { ChallengeDetailScreen } from '@feature/challenge/detail/screen/ChallengeDetailScreen';
import {
  buildResourceMetadata,
  fetchPublicResource,
  SITE_TITLE,
  toMetaDescription,
} from '@module/metadata/seo';
import type { Metadata } from 'next';
import React, { Suspense } from 'react';

interface ChallengeDetailProps {
  params: Promise<{ id: string }>;
}

/**
 * 공개(PUBLIC)·공식(OFFICIAL) 챌린지만 상세 메타를 채운다. 비공개(PRIVATE)·
 * 삭제·인증 필요·조회 실패는 빈 객체를 반환해 루트 기본 메타(기본 OG)로
 * 폴백한다. 썸네일이 있으면 OG 이미지로 쓰고 없으면 기본 이미지로 폴백.
 */
export async function generateMetadata({
  params,
}: ChallengeDetailProps): Promise<Metadata> {
  const { id } = await params;
  const detail = await fetchPublicResource<ChallengeDetailResponse>(
    `/challenges/${id}`
  );
  const summary = detail?.challengeSummary;
  if (!summary || summary.challengeType === 'PRIVATE' || summary.deleted) {
    return {};
  }

  return buildResourceMetadata({
    title: `${summary.title} | ${SITE_TITLE}`,
    description: toMetaDescription(detail.challengeDetail.description),
    imageUrl: summary.thumbnailImage,
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
