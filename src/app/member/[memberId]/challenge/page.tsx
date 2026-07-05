import { MemberChallengeListScreen } from '@feature/challenge/board/screen/MemberChallengeListScreen';
import React from 'react';

interface MemberChallengeListProps {
  params: Promise<{ memberId: string }>;
}

export default async function MemberChallengeListPage({
  params,
}: MemberChallengeListProps): Promise<React.ReactElement> {
  const { memberId } = await params;

  return <MemberChallengeListScreen memberId={memberId} />;
}
