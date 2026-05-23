import { NOTICE_ITEMS } from '@constants/consts/noticeData';
import { NoticeDetailScreen } from '@feature/notice/screen/NoticeDetailScreen';
import { notFound } from 'next/navigation';
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
  const notice = NOTICE_ITEMS.find((item) => item.id === id);
  if (!notice) {
    notFound();
  }

  return <NoticeDetailScreen notice={notice} />;
}
