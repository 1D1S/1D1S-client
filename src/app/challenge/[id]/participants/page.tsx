import { ChallengeParticipantListScreen } from '@feature/challenge/detail/screen/ChallengeParticipantListScreen';
import React from 'react';

interface ChallengeParticipantListPageProps {
  params: Promise<{ id: string }>;
}

export default async function ChallengeParticipantListPage({
  params,
}: ChallengeParticipantListPageProps): Promise<React.ReactElement> {
  const { id } = await params;

  return <ChallengeParticipantListScreen id={id} />;
}
