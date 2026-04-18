import { DiaryDetailScreen } from '@feature/diary/detail/screen/diary-detail-screen';
import {
  hasServerAccessToken,
  resolveLoginRequiredRedirect,
} from '@module/utils/server-auth';
import { redirect } from 'next/navigation';
import React from 'react';

interface DiaryDetailProps {
  params: Promise<{ id: string }>;
}

export default async function DiaryDetailPage({
  params,
}: DiaryDetailProps): Promise<React.ReactElement> {
  const { id } = await params;
  const diaryId = Number(id);

  const isAuthenticated = await hasServerAccessToken();
  if (!isAuthenticated) {
    const target = await resolveLoginRequiredRedirect(
      '/diary',
      `/diary/${id}`
    );
    redirect(target);
  }

  return <DiaryDetailScreen id={diaryId} />;
}
