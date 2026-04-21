import { ChallengeDetailScreen } from '@feature/challenge/detail/screen/ChallengeDetailScreen';
import {
  hasServerAccessToken,
  resolveLoginRequiredRedirect,
} from '@module/utils/serverAuth';
import { redirect } from 'next/navigation';
import React from 'react';

interface ChallengeDetailProps {
  params: Promise<{ id: string }>;
}

export default async function ChallengeDetail({
  params,
}: ChallengeDetailProps): Promise<React.ReactElement> {
  const { id } = await params;

  const isAuthenticated = await hasServerAccessToken();
  if (!isAuthenticated) {
    const target = await resolveLoginRequiredRedirect(
      '/challenge',
      `/challenge/${id}`
    );
    redirect(target);
  }

  return <ChallengeDetailScreen id={id} />;
}
