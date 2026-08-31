import InstallGuideScreen from '@feature/install/screen/InstallGuideScreen';
import { buildPageMetadata } from '@module/metadata/seo';
import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = buildPageMetadata({
  title: '홈 화면에 추가하기 | 1Day 1Streak',
  description: '1Day 1Streak 을 홈 화면에 추가해 앱처럼 사용하는 방법입니다.',
  path: '/install',
  type: 'website',
});

export default function InstallPage(): React.ReactElement {
  return <InstallGuideScreen />;
}
