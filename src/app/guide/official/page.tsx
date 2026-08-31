import OfficialGuideScreen from '@feature/guide/screen/OfficialGuideScreen';
import { buildPageMetadata } from '@module/metadata/seo';
import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = buildPageMetadata({
  title: '공식 챌린지 가이드 | 1Day 1Streak',
  description: '1Day 1Streak 공식 챌린지의 운영 방식과 참여 방법을 안내합니다.',
  path: '/guide/official',
  type: 'website',
});

export default function OfficialGuidePage(): React.ReactElement {
  return <OfficialGuideScreen />;
}
