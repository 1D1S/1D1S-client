import ChallengeEditScreen from '@feature/challenge/write/screen/challenge-edit-screen';
import React from 'react';

interface ChallengeEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function ChallengeEditPage({
  params,
}: ChallengeEditPageProps): Promise<React.ReactElement> {
  const { id } = await params;

  return <ChallengeEditScreen id={id} />;
}
