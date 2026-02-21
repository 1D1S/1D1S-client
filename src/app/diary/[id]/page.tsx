import { createMockDiaryDetail } from '@feature/diary/detail/consts/diary-detail-data';
import { DiaryDetailScreen } from '@feature/diary/detail/screen/diary-detail-screen';
import React from 'react';

interface DiaryDetailProps {
  params: Promise<{ id: string }>;
}

export default async function DiaryDetail({
  params,
}: DiaryDetailProps): Promise<React.ReactElement> {
  const { id } = await params;
  const diaryData = createMockDiaryDetail(id);

  return <DiaryDetailScreen diaryData={diaryData} />;
}
