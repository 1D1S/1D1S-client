import { ChallengeDiaryListScreen } from '@feature/challenge/detail/screen/ChallengeDiaryListScreen';
import React from 'react';

interface ChallengeDiaryListPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ date?: string }>;
}

export default async function ChallengeDiaryListPage({
  params,
  searchParams,
}: ChallengeDiaryListPageProps): Promise<React.ReactElement> {
  const { id } = await params;
  const { date } = await searchParams;

  return <ChallengeDiaryListScreen id={id} date={date} />;
}
