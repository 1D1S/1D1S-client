import { DIARY_QUERY_KEYS } from '@feature/diary/board/consts/queryKeys';
import { MEMBER_QUERY_KEYS } from '@feature/member/consts/queryKeys';
import MemberProfileScreen from '@feature/member/profile/screen/MemberProfileScreen';
import {
  getServerMemberDiaries,
  getServerMemberProfile,
} from '@module/api/serverApi';
import React from 'react';

import { Prefetch } from '@/app.lib/Prefetch';

interface MemberProfileProps {
  params: Promise<{ memberId: string }>;
}

const MEMBER_DIARIES_SIZE = 10;

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
        {
          queryKey: DIARY_QUERY_KEYS.memberDiaries(memberIdNum, {
            size: MEMBER_DIARIES_SIZE,
          }),
          queryFn: () =>
            getServerMemberDiaries(memberIdNum, MEMBER_DIARIES_SIZE),
        },
      ]}
    >
      <MemberProfileScreen memberId={memberIdNum} />
    </Prefetch>
  );
}
