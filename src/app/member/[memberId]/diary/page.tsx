import { MemberDiaryListScreen } from '@feature/diary/board/screen/MemberDiaryListScreen';
import { MEMBER_QUERY_KEYS } from '@feature/member/consts/queryKeys';
import { getServerMemberProfile } from '@module/api/serverApi';
import React from 'react';

import { Prefetch } from '@/app.lib/Prefetch';

const MEMBER_DIARY_PAGE_SIZE = 12;

interface MemberDiaryListProps {
  params: Promise<{ memberId: string }>;
}

export default async function MemberDiaryListPage({
  params,
}: MemberDiaryListProps): Promise<React.ReactElement> {
  const { memberId } = await params;
  const memberIdNum = Number(memberId);

  return (
    <Prefetch
      queries={[
        {
          type: 'infinite',
          queryKey: MEMBER_QUERY_KEYS.profileDiariesInfinite(memberIdNum, {
            size: MEMBER_DIARY_PAGE_SIZE,
          }),
          initialPageParam: 0,
          queryFn: () =>
            getServerMemberProfile(memberIdNum, {
              page: 0,
              size: MEMBER_DIARY_PAGE_SIZE,
            }),
        },
      ]}
    >
      <MemberDiaryListScreen memberId={memberId} />
    </Prefetch>
  );
}
