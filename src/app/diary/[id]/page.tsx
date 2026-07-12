import { DiaryDetail } from '@feature/diary/board/type/diary';
import { DiaryDetailScreen } from '@feature/diary/detail/screen/DiaryDetailScreen';
import {
  buildResourceMetadata,
  fetchPublicResource,
  SITE_TITLE,
  toMetaDescription,
} from '@module/metadata/seo';
import type { Metadata } from 'next';
import React from 'react';

interface DiaryDetailProps {
  params: Promise<{ id: string }>;
}

/**
 * 공개(isPublic) 일지만 상세 메타를 채운다. 비공개·삭제·인증 필요·조회 실패는
 * 빈 객체를 반환해 루트 기본 메타(기본 OG)로 폴백한다. 썸네일(없으면 첫
 * 이미지)이 있으면 OG 이미지로 쓰고 없으면 기본 이미지로 폴백.
 */
export async function generateMetadata({
  params,
}: DiaryDetailProps): Promise<Metadata> {
  const { id } = await params;
  const diary = await fetchPublicResource<DiaryDetail>(`/diaries/${id}`);
  if (!diary || !diary.isPublic) {
    return {};
  }

  return buildResourceMetadata({
    title: `${diary.title} | ${SITE_TITLE}`,
    description: toMetaDescription(diary.content),
    imageUrl: diary.thumbnailUrl ?? diary.imgUrl?.[0] ?? null,
  });
}

/**
 * 상세 데이터는 클라이언트 React Query(useDiaryDetail)로 이관했다.
 * 인증 가드는 `src/app.module/middleware/auth.ts` 의 미들웨어가 동일 로직
 * (access 토큰 또는 세션 힌트)으로 처리하므로 페이지 레벨 `hasServerSession`
 * 게이트는 제거했다. 만료 힌트만 있는 경우는 DiaryDetailScreen 의
 * useIsLoggedIn + LoginRequiredDialog 가 가린다.
 *
 * 서버에서 쿠키를 읽지 않으므로 route 가 dynamic 강제에서 풀려 `<Link>`
 * prefetch 로 셸이 미리 채워지고, 목록↔상세 왕복 시 QueryClient 캐시가
 * 즉시 서빙된다.
 */
export default async function DiaryDetailPage({
  params,
}: DiaryDetailProps): Promise<React.ReactElement> {
  const { id } = await params;
  return <DiaryDetailScreen id={Number(id)} />;
}
