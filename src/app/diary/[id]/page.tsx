import { DiaryDetailScreen } from '@feature/diary/detail/screen/DiaryDetailScreen';
import React from 'react';

interface DiaryDetailProps {
  params: Promise<{ id: string }>;
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
