import { MEMBER_QUERY_KEYS } from '@feature/member/consts/queryKeys';
import MemberProfileScreen from '@feature/member/profile/screen/MemberProfileScreen';
import { getServerMemberProfile } from '@module/api/serverApi';
import React from 'react';

import { Prefetch } from '@/app.lib/Prefetch';

interface MemberProfileProps {
  params: Promise<{ memberId: string }>;
}

export default async function MemberProfilePage({
  params,
}: MemberProfileProps): Promise<React.ReactElement> {
  const { memberId } = await params;
  const memberIdNum = Number(memberId);

  return (
    <Prefetch
      queries={[
        {
          queryKey: MEMBER_QUERY_KEYS.profile(memberIdNum),
          queryFn: () => getServerMemberProfile(memberIdNum),
        },
      ]}
    >
      <MemberProfileScreen memberId={memberIdNum} />
    </Prefetch>
  );
}
