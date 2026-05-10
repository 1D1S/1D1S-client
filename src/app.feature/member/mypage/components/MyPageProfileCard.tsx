'use client';

import { Button, CircleAvatar, Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import { Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

interface ProfileStatProps {
  label: string;
  value: number;
}

function ProfileStat({ label, value }: ProfileStatProps): React.ReactElement {
  return (
    <div className="flex items-baseline gap-1.5">
      <Text size="body1" weight="bold" className="text-gray-900">
        {value}
      </Text>
      <Text size="caption1" weight="regular" className="text-gray-500">
        {label}
      </Text>
    </div>
  );
}

interface MyPageProfileCardProps {
  nickname: string;
  profileUrl: string;
  email?: string;
  totalDiaryCount: number;
  totalChallengeCount: number;
  completedFiniteChallengeCount: number;
  /** 우측 액션 영역 — 미지정 시 기본 (프로필 편집 + 설정) 사용 */
  actions?: React.ReactNode;
}

/**
 * 배너에 -60px 마진으로 겹쳐 올라오는 프로필 카드.
 * 좌측 96px 아바타 + 닉네임/핸들/스탯 + 우측 액션.
 */
export function MyPageProfileCard({
  nickname,
  profileUrl,
  email,
  totalDiaryCount,
  totalChallengeCount,
  completedFiniteChallengeCount,
  actions,
}: MyPageProfileCardProps): React.ReactElement {
  const router = useRouter();
  const handle = email
    ? `@${email.split('@')[0]}`
    : `@${nickname}`;
  const defaultActions = (
    <>
      <Button
        variant="default"
        size="medium"
        onClick={() => router.push('/mypage/settings')}
      >
        프로필 편집
      </Button>
      <button
        type="button"
        aria-label="설정"
        onClick={() => router.push('/mypage/notification-settings')}
        className={cn(
          'rounded-2 flex h-10 w-10 items-center justify-center',
          'bg-gray-100 text-gray-600 transition hover:bg-gray-200',
        )}
      >
        <Settings className="h-4 w-4" />
      </button>
    </>
  );

  return (
    <section
      className={cn(
        'rounded-4 relative -mt-15 border border-gray-200 bg-white',
        'p-5 shadow-[0_6px_20px_rgba(0,0,0,0.06)]',
        'flex flex-col gap-5',
        'sm:flex-row sm:items-center sm:gap-5 sm:p-6',
      )}
    >
      <div className="flex shrink-0 justify-center sm:block">
        <div
          className={cn(
            'h-24 w-24 overflow-hidden rounded-full border-4',
            'border-white shadow-md',
          )}
        >
          <CircleAvatar
            imageUrl={profileUrl}
            size="xl"
            className="h-full w-full"
          />
        </div>
      </div>

      <div className="min-w-0 flex-1 text-center sm:text-left">
        <Text size="display2" weight="bold" className="text-gray-900">
          {nickname}
        </Text>
        <div className="mt-1">
          <Text size="caption1" weight="regular" className="text-gray-500">
            {handle}
          </Text>
        </div>
        <div
          className={cn(
            'mt-3 flex flex-wrap justify-center gap-4',
            'sm:justify-start',
          )}
        >
          <ProfileStat label="작성한 일지" value={totalDiaryCount} />
          <ProfileStat label="참여 챌린지" value={totalChallengeCount} />
          <ProfileStat
            label="완료 챌린지"
            value={completedFiniteChallengeCount}
          />
        </div>
      </div>

      <div
        className={cn(
          'flex shrink-0 items-center gap-2',
          'justify-center sm:justify-end',
        )}
      >
        {actions ?? defaultActions}
      </div>
    </section>
  );
}
