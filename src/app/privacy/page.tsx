import PrivacyScreen from '@feature/legal/screen/PrivacyScreen';
import { buildPageMetadata } from '@module/metadata/seo';
import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = buildPageMetadata({
  title: '개인정보 처리방침 | 1Day 1Streak',
  description: '1Day 1Streak 개인정보 처리방침입니다.',
  path: '/privacy',
  type: 'website',
});

export default function PrivacyPage(): React.ReactElement {
  return <PrivacyScreen />;
}
