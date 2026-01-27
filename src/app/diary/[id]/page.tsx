import React from 'react';
import { DiaryDetailClient } from './diary-detail-client';

export const revalidate = 60;

interface DiaryDetailProps {
  params: Promise<{ id: string }>;
}

interface DiaryData {
  id: string;
  title: string;
  author: string;
  createdAt: string;
  content: string;
  imageSrc?: string;
  challengeGoals: Array<{
    id: string;
    label: string;
    completed: boolean;
  }>;
}

async function getDiaryData(id: string): Promise<DiaryData> {
  return {
    id,
    title: `일지 제목 ${id}`,
    author: '작성자 이름',
    createdAt: '2025-04-07',
    content: '123131312312313123123123',
    imageSrc: 'https://picsum.photos/200/300',
    challengeGoals: [
      { id: '1', label: '챌린지 목표 1', completed: true },
      { id: '2', label: '챌린지 목표 2', completed: true },
    ],
  };
}

export default async function DiaryDetail({
  params,
}: DiaryDetailProps): Promise<React.ReactElement> {
  const { id } = await params;
  const diaryData = await getDiaryData(id);

  return <DiaryDetailClient diaryData={diaryData} />;
}
