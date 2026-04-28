'use client';

import { CircleAvatar, Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import { useRouter } from 'next/navigation';
import React from 'react';

interface MyPageProfileCardProps {
  nickname: string;
  profileUrl: string;
}

export function MyPageProfileCard({
  nickname,
  profileUrl,
}: MyPageProfileCardProps): React.ReactElement {
  const router = useRouter();

  return (
    <section className="rounded-4 border border-gray-200 bg-white p-5 text-center">
      <div
        className={cn(
          'border-main-800/20 bg-main-200 mx-auto mb-3',
          'flex h-[80px] w-[80px] items-center justify-center',
          'rounded-full border-4',
        )}
      >
        <CircleAvatar imageUrl={profileUrl} size="lg" />
      </div>
      <Text size="display2" weight="bold" className="text-gray-900">
        {nickname}
      </Text>
      <button
        type="button"
        onClick={() => router.push('/mypage/settings')}
        className={cn(
          'mt-5 w-full cursor-pointer rounded-xl border',
          'border-gray-200 bg-white px-4 py-3 text-gray-800',
          'transition hover:bg-gray-100',
        )}
      >
        <Text size="body1" weight="bold">
          계정 설정
        </Text>
      </button>
    </section>
  );
}
