import { DIARY_QUERY_KEYS } from '@feature/diary/board/consts/queryKeys';
import { MemberDiaryListScreen } from '@feature/diary/board/screen/MemberDiaryListScreen';
import { getServerMemberDiaries } from '@module/api/serverApi';
import React from 'react';

import { Prefetch } from '@/app.lib/Prefetch';

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
          queryKey: DIARY_QUERY_KEYS.memberDiaries(memberIdNum, {
            size: undefined,
          }),
          queryFn: () => getServerMemberDiaries(memberIdNum),
        },
      ]}
    >
      <MemberDiaryListScreen memberId={memberId} />
    </Prefetch>
  );
}
