/* eslint-disable no-use-before-define */
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CircleAvatar, Streak, Text } from '@1d1s/design-system';
import {
  Check,
  CheckCircle2,
  FileText,
  Flag,
  Flame,
  Gauge,
  Plus,
  Target,
  Trophy,
  Users,
  X,
} from 'lucide-react';

export default function MyPage(): React.ReactElement {
  const router = useRouter();

  const streakData = Array.from({ length: 364 }).map((_, index) => {
    const activityLevel = (index * 11 + 7) % 8;
    const count = activityLevel <= 1 ? 0 : activityLevel <= 3 ? 1 : activityLevel <= 5 ? 3 : 6;

    const baseDate = new Date(2025, 0, 1);
    baseDate.setDate(baseDate.getDate() + index);
    const date = baseDate.toISOString().slice(0, 10);

    return { date, count };
  });

  return (
    <div className="min-h-screen w-full bg-white p-4">
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

          <ChallengeProgressCard
            title="고라니 밥주기"
            dday="D-15"
            progress={60}
            countText="12/20명 참여"
            tone="orange"
          />
          <ChallengeProgressCard
            title="매일 일기 쓰기"
            dday="D-25"
            progress={80}
            countText="8/10명 참여"
            tone="blue"
          />
          <ChallengeProgressCard
            title="아침 운동 인증"
            dday="종료됨"
            progress={100}
            countText="24/30명 참여"
            tone="gray"
          />
        </div>

        <main className="space-y-4">
          <section className="rounded-4 border border-gray-200 bg-white p-5">
            <div className="flex items-start gap-2">
              <div className="mt-1 rounded-1.5 bg-main-200 p-1 text-main-800">
                <Gauge className="h-4 w-4" />
              </div>
              <div>
                <Text size="display1" weight="bold" className="text-gray-900">
                  User Statistics
                </Text>
                <Text size="body1" weight="regular" className="mt-1 text-gray-600">
                  나의 활동 기록과 성장 지표를 한눈에 확인하세요.
                </Text>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <StatCard icon={<Flame className="h-4 w-4" />} title="현재 일지 스트릭" value="12" unit="일" />
              <StatCard icon={<Trophy className="h-4 w-4" />} title="일지 최장 스트릭" value="42" unit="일" />
              <StatCard icon={<Trophy className="h-4 w-4" />} title="목표 최장 스트릭" value="30" unit="일" />
              <StatCard icon={<Flag className="h-4 w-4" />} title="참여한 모든 챌린지" value="15" unit="개" iconTone="text-blue-600" />
              <StatCard icon={<CheckCircle2 className="h-4 w-4" />} title="완료한 단기 챌린지" value="8" unit="개" iconTone="text-emerald-600" />
              <StatCard icon={<FileText className="h-4 w-4" />} title="작성한 전체 일지" value="156" unit="개" iconTone="text-purple-600" />
              <StatCard icon={<Target className="h-4 w-4" />} title="완료한 전체 목표" value="320" unit="개" iconTone="text-pink-600" />
            </div>
          </section>

          <section className="rounded-4 border border-gray-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className="h-5 w-5 text-main-800" />
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
                    1건
                  </Text>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CircleAvatar
                      imageUrl="https://picsum.photos/seed/friend-request/80/80"
                      size="md"
                    />
                    <div>
                      <Text size="heading2" weight="bold" className="text-gray-900">
                        DesignKing
                      </Text>
                      <Text size="body2" weight="regular" className="text-gray-600">
                        함께 챌린지 해요!
                      </Text>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-main-200 text-main-800"
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
                  <FriendRow name="HealthLover" status="🔥 연속 11일 활동" imageSeed="friend-health" />
                  <FriendRow name="DevMaster" status="10분 전 활동" imageSeed="friend-dev" />
                </div>
              </div>
            </div>
          </section>
        </main>

        <aside className="space-y-4">
          <section className="rounded-4 border border-gray-200 bg-white p-5 text-center">
            <div className="mx-auto mb-3 flex h-[120px] w-[120px] items-center justify-center rounded-full border-4 border-main-800/20 bg-main-200">
              <CircleAvatar imageUrl="https://picsum.photos/seed/mypage-user/200/200" size="xl" />
            </div>
            <Text size="display2" weight="bold" className="text-gray-900">
              닉네임
            </Text>
            <div className="mt-2 flex items-center justify-center gap-1 text-gray-600">
              <Users className="h-4 w-4" />
              <Text size="body2" weight="medium">
                친구 24명
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
        </aside>
      </div>
    </div>
  );
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
    tone === 'orange' ? 'bg-main-200 text-main-800' : tone === 'blue' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-500';

  return (
    <article className="rounded-4 border border-gray-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${iconBgClass}`}>
          <span className="text-lg">{tone === 'orange' ? '🐾' : tone === 'blue' ? '✍️' : '🏃'}</span>
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
        <div className={`h-full rounded-full ${toneClass.split(' ')[0]}`} style={{ width: `${progress}%` }} />
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
        <CircleAvatar imageUrl={`https://picsum.photos/seed/${imageSeed}/80/80`} size="md" />
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
    tone === 'main'
      ? 'bg-main-200 text-main-800'
      : 'bg-blue-100 text-blue-600';

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-white px-3 py-3 transition hover:bg-gray-100"
    >
      <div className="flex items-center gap-3">
        <span className={`flex h-9 w-9 items-center justify-center rounded-full ${iconClass}`}>
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
