'use client';

import { Icon, StreakHero } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react';

interface ChallengeProgressItem {
  id: string;
  title: string;
  progress: number;
  hasDeadline: boolean;
}

interface AppRightRailProps {
  isLoggedIn: boolean;
  nickname: string;
  handle?: string;
  profileImageUrl?: string;
  streakDays: number;
  todayGoalCount: number;
  challenges: ChallengeProgressItem[];
  onChallengeClick(id: string): void;
}

export default function AppRightRail({
  isLoggedIn,
  nickname,
  handle,
  profileImageUrl,
  streakDays,
  todayGoalCount,
  challenges,
  onChallengeClick,
}: AppRightRailProps): React.ReactElement {
  const router = useRouter();

  if (!isLoggedIn) {
    return (
      <aside
        className={cn(
          'sticky top-[62px] flex h-[calc(100vh-62px)] w-[280px]',
          'shrink-0 flex-col gap-4 overflow-y-auto border-l border-gray-200',
          'bg-white p-5'
        )}
      >
        <button
          type="button"
          onClick={() => router.push('/login')}
          aria-label="로그인 페이지로 이동"
          className={cn(
            'group flex flex-col items-stretch gap-3 p-5 text-center',
            'rounded-3 border-main-200 bg-main-100 border',
            'transition hover:brightness-105'
          )}
        >
          <span aria-hidden className="text-[28px]">
            🔥
          </span>
          <span className="text-[13px] font-extrabold text-gray-900">
            게스트
          </span>
          <span className="text-[11px] leading-relaxed text-gray-600">
            로그인 후 스트릭과 오늘의 목표를
            <br />
            확인할 수 있어요.
          </span>
          <span
            className={cn(
              'mt-1 inline-flex w-full items-center justify-center',
              'rounded-2 bg-brand px-3 py-2',
              'text-[12px] font-bold text-white',
              'transition group-hover:brightness-105'
            )}
          >
            로그인하고 시작하기
          </span>
        </button>
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        'sticky top-[62px] flex h-[calc(100vh-62px)] w-[280px]',
        'shrink-0 flex-col gap-4 overflow-y-auto border-l border-gray-200',
        'bg-white p-5'
      )}
    >
      {/* Profile card */}
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'h-12 w-12 overflow-hidden rounded-full',
            'border-main-200 bg-main-100 border-2'
          )}
        >
          {profileImageUrl ? (
            <Image
              src={profileImageUrl}
              alt={nickname}
              width={48}
              height={48}
              className="h-full w-full object-cover"
            />
          ) : null}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14px] font-extrabold text-gray-900">
            {nickname}
          </div>
          {handle ? (
            <div className="truncate text-[11px] text-gray-500">{handle}</div>
          ) : null}
        </div>
        <button
          type="button"
          aria-label="설정"
          onClick={() => router.push('/mypage/settings')}
          className="text-gray-500 transition hover:text-gray-700"
        >
          <Icon name="Settings" size={16} />
        </button>
      </div>

      {/* Streak hero */}
      <StreakHero
        days={streakDays}
        meta={`오늘의 목표 ${todayGoalCount}개`}
      />

      {/* Active challenges */}
      <div>
        <div
          className={cn(
            'mb-2 text-[12px] font-extrabold tracking-tight text-gray-900'
          )}
        >
          진행 중인 챌린지
        </div>
        {challenges.length === 0 ? (
          <p className="text-[11px] text-gray-500">
            아직 참여 중인 챌린지가 없어요.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {challenges.slice(0, 5).map((challenge) => (
              <button
                key={challenge.id}
                type="button"
                onClick={() => onChallengeClick(challenge.id)}
                className={cn(
                  'rounded-2 flex flex-col gap-1.5 p-2 text-left',
                  'transition hover:bg-gray-50'
                )}
              >
                <span className="truncate text-[12px] font-bold text-gray-900">
                  {challenge.title}
                </span>
                <span className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <span
                    className="bg-brand block h-full"
                    style={{ width: `${challenge.progress}%` }}
                  />
                </span>
                <span className="text-[10px] text-gray-500">
                  {challenge.hasDeadline
                    ? `${challenge.progress}% 진행`
                    : '무기한'}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => router.push('/diary/create')}
        className={cn(
          'rounded-2 bg-brand mt-auto py-2.5',
          'text-[12px] font-bold text-white transition',
          'hover:brightness-105'
        )}
      >
        + 일지 쓰기
      </button>
    </aside>
  );
}
