/* eslint-disable no-use-before-define */
'use client';

import { CircleAvatar, Streak, Text } from '@1d1s/design-system';
import { useLogout } from '@feature/auth/hooks/use-auth-mutations';
import { useMyPage } from '@feature/member/hooks/use-member-queries';
import { authStorage } from '@module/utils/auth';
import {
  CheckCircle2,
  FileText,
  Flame,
  Gauge,
  LogOut,
  PencilLine,
  Plus,
  Target,
  Trophy,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function MyPage(): React.ReactElement {
  const router = useRouter();
  const logout = useLogout();
  const { data, isLoading } = useMyPage();

  const handleLogout = (): void => {
    logout.mutate(undefined, {
      onSettled: () => {
        router.replace('/login');
      },
    });
  };

  if (isLoading || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Text size="body1" weight="medium" className="text-gray-500">
          불러오는 중...
        </Text>
      </div>
    );
  }

  const { nickname, profileUrl, streak, challengeList, diaryList } = data;

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
          </div>

          {challengeList.length === 0 ? (
            <div className="rounded-4 border border-gray-200 bg-white p-6 text-center">
              <Text size="body1" weight="medium" className="text-gray-500">
                진행 중인 챌린지가 없습니다.
              </Text>
            </div>
          ) : (
            challengeList.map((ch) => (
              <ChallengeCard
                key={ch.challengeId}
                title={ch.title}
                category={ch.category}
                participantCnt={ch.participantCnt}
                maxParticipantCnt={ch.maxParticipantCnt}
                startDate={ch.startDate}
                endDate={ch.endDate}
              />
            ))
          )}
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
              <StatCard
                icon={<Flame className="h-4 w-4" />}
                title="현재 스트릭"
                value={String(streak.currentStreak)}
                unit="일"
              />
              <StatCard
                icon={<Trophy className="h-4 w-4" />}
                title="최장 스트릭"
                value={String(streak.maxStreak)}
                unit="일"
              />
              <StatCard
                icon={<FileText className="h-4 w-4" />}
                title="전체 일지"
                value={String(streak.totalDiaryCount)}
                unit="개"
                iconTone="text-purple-600"
              />
              <StatCard
                icon={<Target className="h-4 w-4" />}
                title="전체 목표"
                value={String(streak.totalGoalCount)}
                unit="개"
                iconTone="text-pink-600"
              />
              <StatCard
                icon={<CheckCircle2 className="h-4 w-4" />}
                title="이번 달 일지"
                value={String(streak.currentMonthDiaryCount)}
                unit="개"
                iconTone="text-emerald-600"
              />
              <StatCard
                icon={<CheckCircle2 className="h-4 w-4" />}
                title="이번 달 목표"
                value={String(streak.currentMonthGoalCount)}
                unit="개"
                iconTone="text-blue-600"
              />
              <StatCard
                icon={<Target className="h-4 w-4" />}
                title="오늘의 목표"
                value={String(streak.todayGoalCount)}
                unit="개"
                iconTone="text-main-800"
              />
            </div>
          </section>

          <section className="rounded-4 border border-gray-200 bg-white p-5">
            <div className="mb-4 flex items-center gap-2">
              <Gauge className="text-main-800 h-5 w-5" />
              <Text size="display2" weight="bold" className="text-gray-900">
                활동 기록
              </Text>
            </div>

            <Streak data={streak.calendar} size={14} gap={6} />
          </section>

          {diaryList.length > 0 && (
            <section className="space-y-4">
              <Text size="display2" weight="bold" className="text-gray-900">
                최근 일지
              </Text>
              {diaryList.map((diary) => (
                <article
                  key={diary.id}
                  className="rounded-4 border border-gray-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between">
                    <Text
                      size="heading1"
                      weight="bold"
                      className="text-gray-900"
                    >
                      {diary.title}
                    </Text>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Text size="body2" weight="medium">
                        {diary.isPublic ? '공개' : '비공개'}
                      </Text>
                    </div>
                  </div>
                  <Text
                    size="body1"
                    weight="regular"
                    className="mt-2 line-clamp-2 text-gray-600"
                  >
                    {diary.content}
                  </Text>
                </article>
              ))}
            </section>
          )}
        </main>

        <aside className="space-y-4">
          <section className="rounded-4 border border-gray-200 bg-white p-5 text-center">
            <div className="border-main-800/20 bg-main-200 mx-auto mb-3 flex h-[120px] w-[120px] items-center justify-center rounded-full border-4">
              <CircleAvatar imageUrl={profileUrl} size="xl" />
            </div>
            <Text size="display2" weight="bold" className="text-gray-900">
              {nickname}
            </Text>
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
                icon={<PencilLine className="h-4 w-4" />}
                title="일지 작성하기"
                onClick={() => router.push('/diary/create')}
              />
              <QuickActionItem
                icon={<Plus className="h-4 w-4" />}
                title="챌린지 만들기"
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

function ChallengeCard({
  title,
  category,
  participantCnt,
  maxParticipantCnt,
  startDate,
  endDate,
}: {
  title: string;
  category: string;
  participantCnt: number;
  maxParticipantCnt: number;
  startDate: string;
  endDate: string;
}): React.ReactElement {
  const today = new Date();
  const end = new Date(endDate);
  const diffDays = Math.ceil(
    (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  const dday = diffDays > 0 ? `D-${diffDays}` : diffDays === 0 ? 'D-Day' : '종료됨';

  const start = new Date(startDate);
  const totalDays = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  const elapsedDays = Math.ceil(
    (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  const progress =
    totalDays > 0
      ? Math.min(100, Math.round((elapsedDays / totalDays) * 100))
      : 0;

  return (
    <article className="rounded-4 border border-gray-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="bg-main-200 text-main-800 flex h-14 w-14 items-center justify-center rounded-2xl">
          <Flame className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <Text size="heading1" weight="bold" className="text-gray-900">
            {title}
          </Text>
          <div className="mt-1 flex items-center gap-2">
            <span className="rounded-lg bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
              {category}
            </span>
            <Text size="body2" weight="medium" className="text-gray-500">
              {dday}
            </Text>
          </div>
        </div>
      </div>

      <div className="mt-4 h-2 rounded-full bg-gray-200">
        <div
          className="bg-main-700 h-full rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <Text size="body2" weight="medium" className="text-gray-500">
          {participantCnt}/{maxParticipantCnt}명 참여
        </Text>
        <Text size="body2" weight="bold" className="text-main-800">
          {progress}%
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
