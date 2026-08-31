import { InquiryScreen } from '@feature/inquiry/screen/InquiryScreen';
import { buildPageMetadata } from '@module/metadata/seo';
import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = buildPageMetadata({
  title: '문의하기 | 1Day 1Streak',
  description: '1Day 1Streak 이용 중 궁금한 점을 문의해 주세요.',
  path: '/inquiry',
  type: 'website',
});

export default function InquiryPage(): React.ReactElement {
  return <InquiryScreen />;
}
