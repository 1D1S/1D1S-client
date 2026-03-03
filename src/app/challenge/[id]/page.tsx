import { ChallengeDetailScreen } from '@feature/challenge/detail/screen/challenge-detail-screen';
import React from 'react';

interface ChallengeDetailProps {
  params: Promise<{ id: string }>;
}

export default async function ChallengeDetail({
  params,
}: ChallengeDetailProps): Promise<React.ReactElement> {
  const { id } = await params;

  return <ChallengeDetailScreen id={id} />;
}
