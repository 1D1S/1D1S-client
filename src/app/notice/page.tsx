import { NoticeScreen } from '@feature/notice/screen/NoticeScreen';
import { buildPageMetadata } from '@module/metadata/seo';
import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = buildPageMetadata({
  title: '공지사항 | 1Day 1Streak',
  description: '1Day 1Streak 서비스 공지사항입니다.',
  path: '/notice',
  type: 'website',
});

export default function NoticePage(): React.ReactElement {
  return <NoticeScreen />;
}
