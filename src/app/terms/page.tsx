import TermsScreen from '@feature/legal/screen/TermsScreen';
import { buildPageMetadata } from '@module/metadata/seo';
import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = buildPageMetadata({
  title: '이용약관 | 1Day 1Streak',
  description: '1Day 1Streak 서비스 이용약관입니다.',
  path: '/terms',
  type: 'website',
});

export default function TermsPage(): React.ReactElement {
  return <TermsScreen />;
}
