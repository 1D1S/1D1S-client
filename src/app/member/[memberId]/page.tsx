import MemberProfileScreen from '@feature/member/profile/screen/MemberProfileScreen';
import React from 'react';

interface MemberProfileProps {
  params: Promise<{ memberId: string }>;
}

/**
 * 프로필 데이터는 클라이언트 React Query(useMemberProfile)로 이관했다.
 * 서버에서 쿠키를 읽지 않으므로 route 가 dynamic 강제에서 풀려 `<Link>`
 * prefetch 로 셸이 미리 채워지고, 이동 시 QueryClient 캐시가 즉시 서빙된다.
 * 비공개 프로필 등 접근 제어는 MemberProfileScreen 이 응답으로 처리한다.
 */
export default async function MemberProfilePage({
  params,
}: MemberProfileProps): Promise<React.ReactElement> {
  const { memberId } = await params;
  return <MemberProfileScreen memberId={Number(memberId)} />;
}
