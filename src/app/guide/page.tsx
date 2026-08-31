import GuideScreen from '@feature/guide/screen/GuideScreen';
import { buildPageMetadata } from '@module/metadata/seo';
import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = buildPageMetadata({
  title: '사용 가이드 | 1Day 1Streak',
  description:
    '챌린지 참여부터 일지 작성까지, 1Day 1Streak 사용법을 안내합니다.',
  path: '/guide',
  type: 'website',
});

export default function GuidePage(): React.ReactElement {
  return <GuideScreen />;
}
