import { CHALLENGE_QUERY_KEYS } from '@feature/challenge/board/consts/queryKeys';
import { ChallengeDetailScreen } from '@feature/challenge/detail/screen/ChallengeDetailScreen';
import { getServerChallengeDetail } from '@module/api/serverApi';
import {
  hasServerSession,
  resolveLoginRequiredRedirect,
} from '@module/utils/serverAuth';
import { redirect } from 'next/navigation';
import React from 'react';

import { Prefetch } from '@/app.lib/Prefetch';

interface ChallengeDetailProps {
  params: Promise<{ id: string }>;
}

export default async function ChallengeDetail({
  params,
}: ChallengeDetailProps): Promise<React.ReactElement> {
  const { id } = await params;
  const challengeId = Number(id);

  const isAuthenticated = await hasServerSession();
  if (!isAuthenticated) {
    const target = await resolveLoginRequiredRedirect(
      '/challenge',
      `/challenge/${id}`
    );
    redirect(target);
  }

  return (
    <Prefetch
      queries={[
        {
          queryKey: CHALLENGE_QUERY_KEYS.detail(challengeId),
          queryFn: () => getServerChallengeDetail(challengeId),
        },
      ]}
    >
      <ChallengeDetailScreen id={id} />
    </Prefetch>
  );
}
