/* eslint-disable no-use-before-define */
'use client';

import { CircleAvatar, Streak, Text } from '@1d1s/design-system';
import { getCategoryLabel } from '@constants/categories';
import { isInfiniteChallengeEndDate } from '@feature/challenge/board/utils/challenge-period';
import { ChallengeCard as DSChallengeCard } from '@feature/challenge/shared/components/challenge-card';
import { formatChallengeCardTypeLabel } from '@feature/challenge/shared/utils/challenge-display';
import {
  useLikeDiary,
  useUnlikeDiary,
} from '@feature/diary/detail/hooks/use-diary-mutations';
import { DiaryCard } from '@feature/diary/shared/components/diary-card';
import { useMemberProfile } from '@feature/member/hooks/use-member-queries';
import type {
  MyPageDiary,
  StreakCalendarItem,
} from '@feature/member/type/member';
import { normalizeApiError } from '@module/api/error';
import { authStorage } from '@module/utils/auth';
import {
  CheckCircle2,
  FileText,
  Flame,
  Target,
  Trophy,
  UserPlus,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React from 'react';

function toLocalDateKey(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${mm}-${dd}`;
}

function buildYearStreak(calendar: StreakCalendarItem[]): StreakCalendarItem[] {
  const today = new Date();
  const calendarMap = new Map(calendar.map((item) => [item.date, item.count]));
  const result: StreakCalendarItem[] = [];
  const cursor = new Date(today.getFullYear(), 0, 1);

  while (cursor <= today) {
    const dateStr = toLocalDateKey(cursor);
    result.push({ date: dateStr, count: calendarMap.get(dateStr) ?? 0 });
    cursor.setDate(cursor.getDate() + 1);
  }

  return result;
}

export default function MemberProfilePage(): React.ReactElement {
  const params = useParams();
  const memberId = Number(params.memberId);
  const router = useRouter();
  const { data, isLoading, isError, error } = useMemberProfile(memberId);
  const likeDiary = useLikeDiary();
  const unlikeDiary = useUnlikeDiary();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Text size="body1" weight="medium" className="text-gray-500">
          불러오는 중...
        </Text>
      </div>
    );
  }

  if (isError || !data) {
    const message = isError ? normalizeApiError(error).message : '';
    const isPrivate = message.includes('비공개');
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Text
          size="body1"
          weight="medium"
          className={isPrivate ? 'text-gray-500' : 'text-red-500'}
        >
          {isPrivate
            ? '비공개 프로필입니다.'
            : message || '프로필을 불러오지 못했습니다.'}
        </Text>
      </div>
    );
  }

  const { nickname, profileUrl, streak, challengeList, diaryList } = data;

  const handleDiaryLikeToggle = (diary: MyPageDiary): void => {
    if (!authStorage.hasTokens()) {
      return;
    }
    if (likeDiary.isPending || unlikeDiary.isPending) {
      return;
    }
    if (diary.likeInfo.likedByMe) {
      unlikeDiary.mutate(diary.id);
    } else {
      likeDiary.mutate(diary.id);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white p-4">
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        {/* 사이드바 */}
        <aside className="xl:order-last">
          <section className="rounded-4 border border-gray-200 bg-white p-5 text-center">
            <div className="border-main-800/20 bg-main-200 mx-auto mb-3 flex h-[80px] w-[80px] items-center justify-center rounded-full border-4">
              <CircleAvatar imageUrl={profileUrl} size="lg" />
            </div>
            <Text size="display2" weight="bold" className="text-gray-900">
              {nickname}
            </Text>

            {/* 친구 추가 버튼 (비활성화 + 툴팁) */}
            <div className="group relative mt-5">
              <button
                type="button"
                disabled
                className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-400"
              >
                <UserPlus className="h-4 w-4" />
                <Text size="body1" weight="bold">
                  친구 추가
                </Text>
              </button>
              <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-lg bg-gray-800 px-3 py-1.5 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
                곧 추가될 기능입니다!
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
              </div>
            </div>
          </section>
        </aside>

        {/* 메인 콘텐츠 */}
        <main className="space-y-4 xl:order-first">
          {/* 활동 통계 */}
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
                {nickname}님의 활동 기록과 성장 지표입니다.
              </Text>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon={<Flame className="h-5 w-5" />}
                title="현재 스트릭"
                value={String(streak.currentStreak)}
                unit="일"
              />
              <StatCard
                icon={<Trophy className="h-5 w-5" />}
                title="최장 스트릭"
                value={String(streak.maxStreak)}
                unit="일"
              />
              <StatCard
                icon={<FileText className="h-5 w-5" />}
                title="전체 일지"
                value={String(streak.totalDiaryCount)}
                unit="개"
                iconTone="text-purple-600"
              />
              <StatCard
                icon={<Target className="h-5 w-5" />}
                title="전체 목표"
                value={String(streak.totalGoalCount)}
                unit="개"
                iconTone="text-pink-600"
              />
              <StatCard
                icon={<CheckCircle2 className="h-5 w-5" />}
                title="이번 달 일지"
                value={String(streak.currentMonthDiaryCount)}
                unit="개"
                iconTone="text-emerald-600"
              />
              <StatCard
                icon={<CheckCircle2 className="h-5 w-5" />}
                title="이번 달 목표"
                value={String(streak.currentMonthGoalCount)}
                unit="개"
                iconTone="text-blue-600"
              />
              <StatCard
                icon={<Target className="h-5 w-5" />}
                title="오늘의 목표"
                value={String(streak.todayGoalCount)}
                unit="개"
                iconTone="text-main-800"
              />
            </div>
          </section>

          {/* 활동 기록 */}
          <section>
            <Text size="display2" weight="bold" className="mb-4 text-gray-900">
              활동 기록
            </Text>
            <Streak data={buildYearStreak(streak.calendar)} size={14} gap={6} />
          </section>

          {/* 진행 중인 챌린지 */}
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
                <div className="flex w-max gap-3 py-2">
                  {challengeList.map((ch) => {
                    const now = new Date();
                    const start = new Date(ch.startDate);
                    const end = new Date(ch.endDate);

                    return (
                      <div key={ch.challengeId} className="w-[320px] shrink-0">
                        <DSChallengeCard
                          challengeTitle={ch.title}
                          challengeType={formatChallengeCardTypeLabel(
                            ch.challengeType,
                            ch.maxParticipantCnt
                          )}
                          challengeCategory={getCategoryLabel(ch.category)}
                          imageUrl={ch.thumbnailImage}
                          currentUserCount={ch.participantCnt}
                          maxUserCount={ch.maxParticipantCnt}
                          startDate={ch.startDate}
                          endDate={ch.endDate}
                          isInfiniteChallenge={isInfiniteChallengeEndDate(
                            ch.endDate
                          )}
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

          {/* 일지 */}
          <section>
            <div className="flex items-center justify-between">
              <Text size="display2" weight="bold" className="text-gray-900">
                {nickname}님의 일지
              </Text>
              {diaryList.pageInfo.hasNextPage && (
                <Link
                  href={`/member/${memberId}/diary`}
                  className="text-main-800 text-sm font-semibold hover:underline"
                >
                  전체 보기
                </Link>
              )}
            </div>

            {diaryList.items.length === 0 ? (
              <div className="rounded-3 mt-4 border border-gray-200 p-6 text-center">
                <Text size="body1" weight="medium" className="text-gray-500">
                  작성한 일지가 없습니다.
                </Text>
              </div>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <div className="flex w-max gap-3 py-2">
                  {diaryList.items.map((diary) => (
                    <div key={diary.id} className="w-[240px] shrink-0">
                      <DiaryCard
                        imageUrl="/images/default-card.png"
                        percent={0}
                        isLiked={diary.likeInfo.likedByMe}
                        likes={diary.likeInfo.likeCnt}
                        title={diary.title}
                        user={nickname}
                        userImage={profileUrl || '/images/default-profile.png'}
                        challengeLabel="일지"
                        date=""
                        emotion="soso"
                        onLikeToggle={() => handleDiaryLikeToggle(diary)}
                        onUserClick={() => router.push(`/member/${memberId}`)}
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
      <div className="flex items-center gap-2.5">
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center ${iconTone}`}
        >
          {icon}
        </span>
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
