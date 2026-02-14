import React from 'react';
import {
  DiaryDetailClient,
} from '@feature/diary/screen/diary-detail-screen';
import { createMockDiaryDetail } from '@feature/diary/consts/diary-detail-data';

interface DiaryDetailProps {
  params: Promise<{ id: string }>;
}

export default async function DiaryDetail({
  params,
}: DiaryDetailProps): Promise<React.ReactElement> {
  const { id } = await params;
  const diaryData = createMockDiaryDetail(id);

  return <DiaryDetailClient diaryData={diaryData} />;
}
