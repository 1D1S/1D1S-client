import React from 'react';
import { ChallengeDetailContent } from './challenge-detail-content';

interface ChallengeDetailProps {
  params: Promise<{ id: string }>;
}

export default async function ChallengeDetail({
  params,
}: ChallengeDetailProps): Promise<React.ReactElement> {
  const { id } = await params;

  return <ChallengeDetailContent id={id} />;
}
