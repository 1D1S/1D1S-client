import AccountDeletionScreen from '@feature/legal/screen/AccountDeletionScreen';
import { buildPageMetadata } from '@module/metadata/seo';
import type { Metadata } from 'next';
import React from 'react';

// 앱스토어 정책상 공개돼야 하는 안내 페이지인데 canonical·og:url 이 없어
// 루트(홈) og:url 을 물고 나갔다. 다른 공개 정적 페이지와 같은 처리를 한다.
export const metadata: Metadata = buildPageMetadata({
  title: '계정 삭제 안내 | 1Day 1Streak',
  description:
    '1Day 1Streak 계정과 관련 데이터의 삭제를 요청하는 방법을 안내합니다.',
  path: '/account-deletion',
  type: 'website',
});

export default function AccountDeletionPage(): React.ReactElement {
  return <AccountDeletionScreen />;
}
