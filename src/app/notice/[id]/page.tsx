import { NoticeDetailScreen } from '@feature/notice/screen/NoticeDetailScreen';
import React from 'react';

interface NoticeDetailPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: '공지사항 | 1Day 1Streak',
};

export default async function NoticeDetailPage({
  params,
}: NoticeDetailPageProps): Promise<React.ReactElement> {
  const { id } = await params;

  return <NoticeDetailScreen id={id} />;
}
