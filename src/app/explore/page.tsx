import ExploreScreen from '@feature/explore/screen/ExploreScreen';
import { buildPageMetadata } from '@module/metadata/seo';
import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = buildPageMetadata({
  title: '탐색 | 1Day 1Streak',
  description: '관심 있는 챌린지와 사람들의 기록을 둘러보세요.',
  path: '/explore',
  type: 'website',
});

export default function ExplorePage(): React.ReactElement {
  return <ExploreScreen />;
}
