import { DIARY_QUERY_KEYS } from '@feature/diary/board/consts/queryKeys';
import { DiaryDetailScreen } from '@feature/diary/detail/screen/DiaryDetailScreen';
import { getServerDiaryDetail } from '@module/api/serverApi';
import {
  hasServerAccessToken,
  resolveLoginRequiredRedirect,
} from '@module/utils/serverAuth';
import { redirect } from 'next/navigation';
import React from 'react';

import { Prefetch } from '@/app.lib/Prefetch';

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

  return (
    <Prefetch
      queries={[
        {
          queryKey: DIARY_QUERY_KEYS.detail(diaryId),
          queryFn: () => getServerDiaryDetail(diaryId),
        },
      ]}
    >
      <DiaryDetailScreen id={diaryId} />
    </Prefetch>
  );
}
