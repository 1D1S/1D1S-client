/* eslint-disable no-use-before-define */
'use client';

import {
  ChallengeCard as DSChallengeCard,
  CircleAvatar,
  DiaryCard,
  Streak,
  Text,
} from '@1d1s/design-system';
import { useMyDiaries } from '@feature/diary/board/hooks/use-diary-queries';
import { DiaryItem } from '@feature/diary/board/type/diary';
import { useMyPage } from '@feature/member/hooks/use-member-queries';
import type { StreakCalendarItem } from '@feature/member/type/member';
import { authStorage } from '@module/utils/auth';
import {
  CheckCircle2,
  FileText,
  Flame,
  PencilLine,
  Plus,
  Target,
  Trophy,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

type DiaryEmotion = 'happy' | 'soso' | 'sad';
type Feeling = 'HAPPY' | 'NORMAL' | 'SAD' | 'NONE';

function buildYearStreak(calendar: StreakCalendarItem[]): StreakCalendarItem[] {
  const year = new Date().getFullYear();
  const today = new Date();
  const calendarMap = new Map(calendar.map((item) => [item.date, item.count]));

  const result: StreakCalendarItem[] = [];
  const cursor = new Date(year, 0, 1);

  while (cursor <= today) {
    const dateStr = cursor.toISOString().slice(0, 10);
    result.push({
      date: dateStr,
      count: calendarMap.get(dateStr) ?? 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return result;
}

function mapFeelingToEmotion(feeling: Feeling): DiaryEmotion {
  switch (feeling) {
    case 'HAPPY':
      return 'happy';
    case 'SAD':
      return 'sad';
    case 'NORMAL':
    case 'NONE':
    default:
      return 'soso';
  }
}

function toRelativeDateLabel(createdAt: string | undefined): string {
  if (!createdAt) {
    return '최근';
  }

  const targetDate = new Date(createdAt);
  if (Number.isNaN(targetDate.getTime())) {
    return '최근';
  }

  const diffMinutes = Math.round((targetDate.getTime() - Date.now()) / 60000);
  const absMinutes = Math.abs(diffMinutes);

  if (absMinutes < 60) {
    return `${absMinutes}분 전`;
  }

  const diffHours = Math.round(absMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}시간 전`;
  }

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}일 전`;
}

function resolveDiaryImage(diary: DiaryItem): string {
  if (Array.isArray(diary.imgUrl) && diary.imgUrl.length > 0) {
    return diary.imgUrl[0] ?? '/images/default-card.png';
  }
  return '/images/default-card.png';
}

export default function MyPage(): React.ReactElement {
  const router = useRouter();
  const { data, isLoading } = useMyPage();
  const { data: myDiaries = [] } = useMyDiaries();

  if (isLoading || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Text size="body1" weight="medium" className="text-gray-500">
          불러오는 중...
        </Text>
      </div>
    );
  }

  const { nickname, profileUrl, streak, challengeList } = data;
  const recentDiaryCards = myDiaries.map((diary) => {
    const diaryInfo = diary.diaryInfoDto;
    const achievementRate =
      diary.achievementRate ?? diaryInfo?.achievementRate ?? 0;

    return {
      id: diary.id,
      title: diary.title || '제목 없는 일지',
      imageUrl: resolveDiaryImage(diary),
      percent: Math.min(100, Math.max(0, achievementRate)),
      isLiked: diary.likeInfo.likedByMe,
      likes: diary.likeInfo.likeCnt,
      user: nickname || '나',
      userImage: profileUrl || '/images/default-profile.png',
      challengeLabel:
        diary.challenge?.title ?? diary.challenge?.category ?? '나의 일지',
      challengeId: diary.challenge?.challengeId,
      date: toRelativeDateLabel(diaryInfo?.createdAt),
      emotion: mapFeelingToEmotion(diaryInfo?.feeling ?? 'NONE'),
    };
  });

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
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <aside className="space-y-4 xl:order-last">
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-1">
            <section className="rounded-4 border border-gray-200 bg-white p-5 text-center">
              <div className="border-main-800/20 bg-main-200 mx-auto mb-3 flex h-[80px] w-[80px] items-center justify-center rounded-full border-4">
                <CircleAvatar imageUrl={profileUrl} size="lg" />
              </div>
              <Text size="display2" weight="bold" className="text-gray-900">
                {nickname}
              </Text>
              <button
                type="button"
                onClick={() => router.push('/mypage/settings')}
                className="mt-5 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-800 transition hover:bg-gray-100"
              >
                <Text size="body1" weight="bold">
                  계정 설정
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
          </div>
        </aside>

        <main className="space-y-4 xl:order-first">
          <section>
            <div>
              <Text size="display2" weight="bold" className="text-gray-900">
                활동 통계
              </Text>
              <Text
                size="caption1"
                weight="regular"
                className="mt-2 block text-gray-500"
              >
                나의 활동 기록과 성장 지표를 한눈에 확인하세요.
              </Text>
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

          <section>
            <Text size="display2" weight="bold" className="mb-4 text-gray-900">
              활동 기록
            </Text>

            <Streak data={buildYearStreak(streak.calendar)} size={14} gap={6} />
          </section>

          <section>
            <Text size="display2" weight="bold" className="text-gray-900">
              진행 중인 챌린지
            </Text>

            {challengeList.length === 0 ? (
              <div className="rounded-3 mt-4 border border-gray-200 p-6 text-center">
                <Text size="body1" weight="medium" className="text-gray-500">
                  진행 중인 챌린지가 없습니다.
                </Text>
              </div>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <div className="flex w-max gap-3 pb-2">
                  {challengeList.map((ch) => {
                    const now = new Date();
                    const start = new Date(ch.startDate);
                    const end = new Date(ch.endDate);

                    return (
                      <div key={ch.challengeId} className="w-[320px] shrink-0">
                        <DSChallengeCard
                          challengeTitle={ch.title}
                          challengeType={ch.challengeType}
                          challengeCategory={ch.category}
                          currentUserCount={ch.participantCnt}
                          maxUserCount={ch.maxParticipantCnt}
                          startDate={ch.startDate}
                          endDate={ch.endDate}
                          isOngoing={now >= start && now <= end}
                          isEnded={now > end}
                          onClick={() =>
                            router.push(`/challenge/${ch.challengeId}`)
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          <section>
            <Text size="display2" weight="bold" className="text-gray-900">
              내 일지
            </Text>

            {recentDiaryCards.length === 0 ? (
              <div className="rounded-3 mt-4 border border-gray-200 p-6 text-center">
                <Text size="body1" weight="medium" className="text-gray-500">
                  작성한 일지가 없습니다.
                </Text>
              </div>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <div className="flex w-max gap-3 pb-2">
                  {recentDiaryCards.map((diary) => (
                    <div key={diary.id} className="w-[240px] shrink-0">
                      <DiaryCard
                        imageUrl={diary.imageUrl}
                        percent={diary.percent}
                        isLiked={diary.isLiked}
                        likes={diary.likes}
                        title={diary.title}
                        user={diary.user}
                        userImage={diary.userImage}
                        challengeLabel={diary.challengeLabel}
                        onChallengeClick={() =>
                          router.push(
                            diary.challengeId
                              ? `/challenge/${diary.challengeId}`
                              : '/challenge'
                          )
                        }
                        date={diary.date}
                        emotion={diary.emotion}
                        onLikeToggle={() => undefined}
                        onClick={() => router.push(`/diary/${diary.id}`)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
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
