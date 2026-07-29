import AccountDeletionScreen from '@feature/legal/screen/AccountDeletionScreen';
import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: '계정 삭제 안내 | 1Day 1Streak',
  description:
    '1Day 1Streak 계정과 관련 데이터의 삭제를 요청하는 방법을 안내합니다.',
};

export default function AccountDeletionPage(): React.ReactElement {
  return <AccountDeletionScreen />;
}
