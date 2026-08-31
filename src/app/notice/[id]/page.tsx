import { NoticeDetailScreen } from '@feature/notice/screen/NoticeDetailScreen';
import { buildPageMetadata } from '@module/metadata/seo';
import type { Metadata } from 'next';
import React from 'react';

interface NoticeDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: NoticeDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  // 공지 본문은 인증 없이 조회할 수 없어 제목·설명은 목록과 동일하게 두고,
  // canonical 만 자기 경로로 고정해 목록의 중복으로 접히지 않게 한다.
  return buildPageMetadata({
    title: '공지사항 | 1Day 1Streak',
    description: '1Day 1Streak 서비스 공지사항입니다.',
    path: `/notice/${id}`,
    type: 'website',
  });
}

export default async function NoticeDetailPage({
  params,
}: NoticeDetailPageProps): Promise<React.ReactElement> {
  const { id } = await params;

  return <NoticeDetailScreen id={id} />;
}
