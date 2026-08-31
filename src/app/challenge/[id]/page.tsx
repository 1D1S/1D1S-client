import { ChallengeDetailSkeleton } from '@component/skeletons/ChallengeDetailSkeleton';
import { ChallengeDetailPreview } from '@feature/challenge/detail/components/ChallengeDetailPreview';
import { ChallengeDetailScreen } from '@feature/challenge/detail/screen/ChallengeDetailScreen';
import {
  buildPageMetadata,
  fetchPublicChallenge,
  SITE_DESCRIPTION,
  SITE_TITLE,
} from '@module/metadata/seo';
import type { Metadata } from 'next';
import React, { Suspense } from 'react';

interface ChallengeDetailProps {
  params: Promise<{ id: string }>;
}

/**
 * 챌린지 상세는 비인증 GET /challenges/{id} 로 제목·설명·썸네일을 채운다.
 * 조회 실패(비공개 403·예약 전 공식 404·네트워크)는 빈 객체를 반환해 루트
 * 기본 메타(기본 OG)로 폴백한다(정보 노출 없음). 썸네일이 있으면 og:image 로,
 * 없으면 기본 OG 이미지.
 */
export async function generateMetadata({
  params,
}: ChallengeDetailProps): Promise<Metadata> {
  const { id } = await params;
  const challenge = await fetchPublicChallenge(id);
  const path = `/challenge/${id}`;
  if (!challenge) {
    // 메타는 못 채워도 canonical 은 자기 자신을 가리켜야 한다 — 없으면
    // 루트 og:url(홈)만 남아 색인에서 홈의 "대체 페이지"로 접힌다.
    return { alternates: { canonical: path } };
  }

  return buildPageMetadata({
    title: `${challenge.title} | ${SITE_TITLE}`,
    description: challenge.description?.trim() || SITE_DESCRIPTION,
    path,
    imageUrl: challenge.thumbnailImage,
  });
}

/**
 * 초기 HTML 에 실제 콘텐츠를 싣는다(SEO).
 *
 * 인증이 필요한 상세는 여전히 클라이언트 React Query(useChallengeDetail)가
 * 가져오고, 그 사이 화면은 스켈레톤을 그린다. 이 스켈레톤이 SSR 결과 =
 * 크롤러가 보는 전부였다("크롤됨-현재 색인 안 됨"). 그래서 비인증 GET
 * /challenges/{id} 로 읽은 공개 정보를 initialChallenge 로 내려, 로딩 동안
 * 제목·설명·기간이 실제로 렌더되게 한다. 참여 상태·목표·일지처럼 인증이
 * 필요한 부분은 그대로 클라이언트 몫이다.
 *
 * generateMetadata 와 같은 fetch 라 Next 의 요청 중복 제거로 왕복은 한 번,
 * revalidate 300 으로 백엔드 부하도 5분에 한 번이다.
 *
 * Suspense 는 ChallengeDetailScreen 의 useSearchParams(?tab) CSR bailout
 * 경계를 겸한다 — 정적 렌더로 떨어지는 경우에도 fallback 에 같은 공개
 * 정보가 실리도록 preview 를 쓴다.
 *
 * 인증 가드는 `src/app.module/middleware/auth.ts` 의 미들웨어가 처리한다.
 */
export default async function ChallengeDetail({
  params,
}: ChallengeDetailProps): Promise<React.ReactElement> {
  const { id } = await params;
  const challenge = await fetchPublicChallenge(id);

  return (
    <Suspense
      fallback={
        challenge ? (
          <ChallengeDetailPreview challenge={challenge} />
        ) : (
          <ChallengeDetailSkeleton />
        )
      }
    >
      <ChallengeDetailScreen
        id={id}
        initialChallenge={challenge ?? undefined}
      />
    </Suspense>
  );
}
