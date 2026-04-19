import { ChallengeDiaryListScreen } from '@feature/challenge/detail/screen/ChallengeDiaryListScreen';
import React from 'react';

interface ChallengeDiaryListPageProps {
  params: Promise<{ id: string }>;
}

export default async function ChallengeDiaryListPage({
  params,
}: ChallengeDiaryListPageProps): Promise<React.ReactElement> {
  const { id } = await params;

  return <ChallengeDiaryListScreen id={id} />;
}
