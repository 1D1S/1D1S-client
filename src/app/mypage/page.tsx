/* eslint-disable no-use-before-define */
'use client';

import { CircleAvatar, Streak, Text } from '@1d1s/design-system';
import type { MyPageStatIconType } from '@constants/consts/mypage-data';
import {
  buildMyPageStreakData,
  MY_PAGE_CHALLENGE_PROGRESS_ITEMS,
  MY_PAGE_FRIEND_ITEMS,
  MY_PAGE_FRIEND_REQUEST_ITEMS,
  MY_PAGE_PROFILE_DATA,
  MY_PAGE_STAT_ITEMS,
} from '@constants/consts/mypage-data';
import { useLogout } from '@feature/auth/hooks/use-auth-mutations';
import { authStorage } from '@module/utils/auth';
import {
  Check,
  CheckCircle2,
  FileText,
  Flag,
  Flame,
  Gauge,
  LogOut,
  Plus,
  Target,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function MyPage(): React.ReactElement {
  const router = useRouter();
  const logout = useLogout();
  const streakData = buildMyPageStreakData();

  const handleLogout = (): void => {
    logout.mutate(undefined, {
      onSettled: () => {
        router.replace('/login');
      },
    });
  };

  return (
    <div className="min-h-screen w-full bg-white p-4">
      {process.env.NODE_ENV === 'development' && (
        <div className="mx-auto mb-4 max-w-[1440px] rounded-lg border border-yellow-300 bg-yellow-50 p-4">
          <Text size="body2" weight="bold" className="mb-2 text-yellow-800">
            [DEV] Token Info
          </Text>
          <div className="space-y-1 font-mono text-xs break-all text-yellow-700">
            <p>
              <span className="font-bold">Access:</span>{' '}
              {authStorage.getAccessToken() ?? 'none'}
            </p>
            <p>
              <span className="font-bold">Refresh:</span>{' '}
              {authStorage.getRefreshToken() ?? 'none'}
            </p>
          </div>
        </div>
      )}
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-4 xl:grid-cols-[320px_minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <Text size="heading2" weight="bold" className="text-gray-700">
              진행 중인 챌린지
            </Text>
            <button type="button" className="text-main-800">
              <Text size="body2" weight="bold">
                전체보기
              </Text>
            </button>
          </div>

          {MY_PAGE_CHALLENGE_PROGRESS_ITEMS.map((item) => (
            <ChallengeProgressCard
              key={item.title}
              title={item.title}
              dday={item.dday}
              progress={item.progress}
              countText={item.countText}
              tone={item.tone}
            />
          ))}
        </div>

        <main className="space-y-4">
          <section className="rounded-4 border border-gray-200 bg-white p-5">
            <div className="flex items-start gap-2">
              <div className="rounded-1.5 bg-main-200 text-main-800 mt-1 p-1">
                <Gauge className="h-4 w-4" />
              </div>
              <div>
                <Text size="display1" weight="bold" className="text-gray-900">
                  User Statistics
                </Text>
                <Text
                  size="body1"
                  weight="regular"
                  className="mt-1 text-gray-600"
                >
                  나의 활동 기록과 성장 지표를 한눈에 확인하세요.
                </Text>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              {MY_PAGE_STAT_ITEMS.map((item) => (
                <StatCard
                  key={item.title}
                  icon={getMyPageStatIcon(item.icon)}
                  title={item.title}
                  value={item.value}
                  unit={item.unit}
                  iconTone={item.iconTone}
                />
              ))}
            </div>
          </section>

          <section className="rounded-4 border border-gray-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className="text-main-800 h-5 w-5" />
                <Text size="display2" weight="bold" className="text-gray-900">
                  활동 기록
                </Text>
              </div>
              <button
                type="button"
                className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-gray-700"
              >
                <Text size="body2" weight="medium">
                  2025년
                </Text>
              </button>
            </div>

            <Streak data={streakData} size={14} gap={6} />
          </section>

          <section className="space-y-4">
            <Text size="display2" weight="bold" className="text-gray-900">
              소셜 활동
            </Text>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <div className="rounded-4 border border-gray-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <Text size="body1" weight="medium" className="text-gray-600">
                    친구 요청 리스트
                  </Text>
                  <Text size="body1" weight="bold" className="text-gray-700">
                    {MY_PAGE_FRIEND_REQUEST_ITEMS.length}건
                  </Text>
                </div>
                {MY_PAGE_FRIEND_REQUEST_ITEMS.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <CircleAvatar imageUrl={item.imageUrl} size="md" />
                      <div>
                        <Text
                          size="heading2"
                          weight="bold"
                          className="text-gray-900"
                        >
                          {item.name}
                        </Text>
                        <Text
                          size="body2"
                          weight="regular"
                          className="text-gray-600"
                        >
                          {item.message}
                        </Text>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="bg-main-200 text-main-800 flex h-10 w-10 items-center justify-center rounded-full"
                        aria-label="친구 요청 수락"
                      >
                        <Check className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-500"
                        aria-label="친구 요청 거절"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-4 border border-gray-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <Text size="body1" weight="medium" className="text-gray-600">
                    친구 리스트
                  </Text>
                  <button type="button" className="text-main-800">
                    <Text size="body2" weight="bold">
                      전체보기
                    </Text>
                  </button>
                </div>

                <div className="space-y-3">
                  {MY_PAGE_FRIEND_ITEMS.map((friend) => (
                    <FriendRow
                      key={friend.name}
                      name={friend.name}
                      status={friend.status}
                      imageSeed={friend.imageSeed}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>

        <aside className="space-y-4">
          <section className="rounded-4 border border-gray-200 bg-white p-5 text-center">
            <div className="border-main-800/20 bg-main-200 mx-auto mb-3 flex h-[120px] w-[120px] items-center justify-center rounded-full border-4">
              <CircleAvatar
                imageUrl={MY_PAGE_PROFILE_DATA.imageUrl}
                size="xl"
              />
            </div>
            <Text size="display2" weight="bold" className="text-gray-900">
              {MY_PAGE_PROFILE_DATA.nickname}
            </Text>
            <div className="mt-2 flex items-center justify-center gap-1 text-gray-600">
              <Users className="h-4 w-4" />
              <Text size="body2" weight="medium">
                친구 {MY_PAGE_PROFILE_DATA.friendCount}명
              </Text>
            </div>
            <button
              type="button"
              className="mt-5 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-800 transition hover:bg-gray-100"
            >
              <Text size="body1" weight="bold">
                프로필 편집
              </Text>
            </button>
          </section>

          <section className="rounded-4 border border-gray-200 bg-white p-5">
            <Text size="body1" weight="medium" className="text-gray-600">
              빠른 실행
            </Text>

            <div className="mt-4 space-y-2">
              <QuickActionItem
                icon={<Flame className="h-4 w-4" />}
                title="일지 작성하기"
                onClick={() => router.push('/diary/create')}
              />
              <QuickActionItem
                icon={<Plus className="h-4 w-4" />}
                title="새 목표 설정"
                onClick={() => router.push('/challenge/create')}
                tone="blue"
              />
            </div>
          </section>

          <button
            type="button"
            onClick={handleLogout}
            disabled={logout.isPending}
            className="rounded-4 flex w-full items-center justify-center gap-2 border border-red-200 bg-white px-4 py-3 text-red-500 transition hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            <Text size="body1" weight="bold">
              {logout.isPending ? '로그아웃 중...' : '로그아웃'}
            </Text>
          </button>
        </aside>
      </div>
    </div>
  );
}

function getMyPageStatIcon(iconType: MyPageStatIconType): React.ReactElement {
  if (iconType === 'flame') {
    return <Flame className="h-4 w-4" />;
  }
  if (iconType === 'trophy') {
    return <Trophy className="h-4 w-4" />;
  }
  if (iconType === 'flag') {
    return <Flag className="h-4 w-4" />;
  }
  if (iconType === 'check-circle') {
    return <CheckCircle2 className="h-4 w-4" />;
  }
  if (iconType === 'file-text') {
    return <FileText className="h-4 w-4" />;
  }
  return <Target className="h-4 w-4" />;
}

function ChallengeProgressCard({
  title,
  dday,
  progress,
  countText,
  tone,
}: {
  title: string;
  dday: string;
  progress: number;
  countText: string;
  tone: 'orange' | 'blue' | 'gray';
}): React.ReactElement {
  const toneClass =
    tone === 'orange'
      ? 'bg-main-700 text-main-800'
      : tone === 'blue'
        ? 'bg-blue-500 text-blue-600'
        : 'bg-gray-400 text-gray-500';

  const iconBgClass =
    tone === 'orange'
      ? 'bg-main-200 text-main-800'
      : tone === 'blue'
        ? 'bg-blue-100 text-blue-600'
        : 'bg-purple-100 text-purple-500';

  return (
    <article className="rounded-4 border border-gray-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${iconBgClass}`}
        >
          <span className="text-lg">
            {tone === 'orange' ? '🐾' : tone === 'blue' ? '✍️' : '🏃'}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <Text size="heading1" weight="bold" className="text-gray-900">
            {title}
          </Text>
          <Text size="body2" weight="medium" className="text-gray-500">
            {dday}
          </Text>
        </div>
      </div>

      <div className="mt-4 h-2 rounded-full bg-gray-200">
        <div
          className={`h-full rounded-full ${toneClass.split(' ')[0]}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <Text size="body2" weight="medium" className="text-gray-500">
          {countText}
        </Text>
        <Text size="body2" weight="bold" className={toneClass.split(' ')[1]}>
          {tone === 'gray' ? '완료' : `${progress}%`}
        </Text>
      </div>
    </article>
  );
}

function StatCard({
  icon,
  title,
  value,
  unit,
  iconTone = 'text-main-800',
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  unit: string;
  iconTone?: string;
}): React.ReactElement {
  return (
    <article className="rounded-3 border border-gray-200 bg-white p-4">
      <div className="flex items-start gap-2">
        <span className={`mt-0.5 ${iconTone}`}>{icon}</span>
        <Text size="body1" weight="medium" className="text-gray-600">
          {title}
        </Text>
      </div>
      <div className="mt-3 flex items-end gap-1">
        <Text size="display2" weight="bold" className="text-gray-900">
          {value}
        </Text>
        <Text size="body1" weight="medium" className="pb-1 text-gray-500">
          {unit}
        </Text>
      </div>
    </article>
  );
}

function FriendRow({
  name,
  status,
  imageSeed,
}: {
  name: string;
  status: string;
  imageSeed: string;
}): React.ReactElement {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <CircleAvatar
          imageUrl={`https://picsum.photos/seed/${imageSeed}/80/80`}
          size="md"
        />
        <div>
          <Text size="heading2" weight="bold" className="text-gray-900">
            {name}
          </Text>
          <Text size="body2" weight="regular" className="text-gray-600">
            {status}
          </Text>
        </div>
      </div>
      <button
        type="button"
        className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-gray-700 transition hover:bg-gray-100"
      >
        <Text size="body2" weight="medium">
          프로필
        </Text>
      </button>
    </div>
  );
}

function QuickActionItem({
  icon,
  title,
  onClick,
  tone = 'main',
}: {
  icon: React.ReactNode;
  title: string;
  onClick(): void;
  tone?: 'main' | 'blue';
}): React.ReactElement {
  const iconClass =
    tone === 'main' ? 'bg-main-200 text-main-800' : 'bg-blue-100 text-blue-600';

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-white px-3 py-3 transition hover:bg-gray-100"
    >
      <div className="flex items-center gap-3">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-full ${iconClass}`}
        >
          {icon}
        </span>
        <Text size="heading2" weight="medium" className="text-gray-800">
          {title}
        </Text>
      </div>
      <Text size="heading2" weight="medium" className="text-gray-400">
        ›
      </Text>
    </button>
  );
}
