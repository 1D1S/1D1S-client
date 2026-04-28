'use client';

import { CircleAvatar, Streak, Text } from '@1d1s/design-system';
import { getCategoryLabel } from '@constants/categories';
import {
  isInfiniteChallengeEndDate,
} from '@feature/challenge/board/utils/challengePeriod';
import {
  ChallengeCard as DSChallengeCard,
} from '@feature/challenge/shared/components/ChallengeCard';
import {
  formatChallengeCardTypeLabel,
} from '@feature/challenge/shared/utils/challengeDisplay';
import { useMyDiaries } from '@feature/diary/board/hooks/useDiaryQueries';
import type { DiaryItem } from '@feature/diary/board/type/diary';
import {
  useLikeDiary,
  useUnlikeDiary,
} from '@feature/diary/detail/hooks/useDiaryMutations';
import { DiaryCard } from '@feature/diary/shared/components/DiaryCard';
import { useIsLoggedIn } from '@feature/member/hooks/useIsLoggedIn';
import { useMyPage } from '@feature/member/hooks/useMemberQueries';
import {
  QuickActionItem,
} from '@feature/member/mypage/components/QuickActionItem';
import { StatCard } from '@feature/member/mypage/components/StatCard';
import {
  buildYearStreak,
  getLongestGoalStreakSummary,
  mapFeelingToEmotion,
  resolveDiaryImage,
  toRelativeDateLabel,
} from '@feature/member/mypage/utils/mypageUtils';
import { cn } from '@module/utils/cn';
import {
  CheckCircle2,
  FileText,
  Flag,
  Flame,
  PencilLine,
  Plus,
  Target,
  Trophy,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function MyPageScreen(): React.ReactElement {
  const router = useRouter();
  const isLoggedIn = useIsLoggedIn();
  const { data, isLoading } = useMyPage();
  const { data: myDiariesData } = useMyDiaries(10);
  const myDiaries = myDiariesData?.items ?? [];
  const hasMoreDiaries = myDiariesData?.pageInfo.hasNextPage ?? false;
  const likeDiary = useLikeDiary();
  const unlikeDiary = useUnlikeDiary();

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
  const longestGoalStreak = getLongestGoalStreakSummary(
    streak.longestGoalStreak
  );

  const handleDiaryLikeToggle = (diary: {
    id: number;
    isLiked: boolean;
  }): void => {
    if (!isLoggedIn) {
      return;
    }
    if (likeDiary.isPending || unlikeDiary.isPending) {
      return;
    }
    if (diary.isLiked) {
      unlikeDiary.mutate(diary.id);
    } else {
      likeDiary.mutate(diary.id);
    }
  };

  const recentDiaryCards = myDiaries.map((diary: DiaryItem) => {
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
      commentCount: diary.commentCount,
      user: nickname || '나',
      userImage: profileUrl || '/images/default-profile.png',
      challengeLabel:
        diary.challenge?.title ||
        getCategoryLabel(diary.challenge?.category) ||
        '나의 일지',
      challengeId: diary.challenge?.challengeId,
      date: toRelativeDateLabel(diaryInfo?.createdAt),
      emotion: mapFeelingToEmotion(diaryInfo?.feeling ?? 'NONE'),
    };
  });

  return (
    <div className="min-h-screen w-full bg-white p-4">
      <div
        className={cn(
          'mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-4',
          'xl:grid-cols-[minmax(0,1fr)_320px]',
        )}
      >
        <aside className="space-y-4 xl:order-last">
          <div
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-1"
          >
            <section
              className="rounded-4 border border-gray-200 bg-white p-5 text-center"
            >
              <div
                className={cn(
                  'border-main-800/20 bg-main-200 mx-auto mb-3',
                  'flex h-[80px] w-[80px] items-center justify-center',
                  'rounded-full border-4',
                )}
              >
                <CircleAvatar imageUrl={profileUrl} size="lg" />
              </div>
              <Text
                size="display2"
                weight="bold"
                className="text-gray-900"
              >
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

            <section
              className="rounded-4 border border-gray-200 bg-white p-5"
            >
              <Text
                size="body1"
                weight="medium"
                className="text-gray-600"
              >
                빠른 실행
              </Text>
              <div className="mt-4 space-y-2">
                <QuickActionItem
                  icon={<PencilLine className="h-5 w-5" />}
                  title="일지 작성하기"
                  onClick={() => router.push('/diary/create')}
                />
                <QuickActionItem
                  icon={<Plus className="h-5 w-5" />}
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
              <Text
                size="display2"
                weight="bold"
                className="text-gray-900"
              >
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

            <div
              className={cn(
                'mt-5 grid grid-cols-1 gap-3',
                'md:grid-cols-2 xl:grid-cols-4',
              )}
            >
              <StatCard
                icon={<Flame className="h-5 w-5" />}
                title="현재 일지 스트릭"
                value={String(streak.currentStreak)}
                unit="일"
              />
              <StatCard
                icon={<Trophy className="h-5 w-5" />}
                title="일지 최장 스트릭"
                value={String(streak.maxStreak)}
                unit="일"
              />
              <StatCard
                icon={<Target className="h-5 w-5" />}
                title="목표 최장 스트릭"
                value={String(longestGoalStreak.streakCount)}
                unit="일"
                iconTone="text-pink-600"
                description={longestGoalStreak.goalTitle}
              />
              <StatCard
                icon={<Flag className="h-5 w-5" />}
                title="참여한 챌린지 수"
                value={String(streak.totalChallengeCount ?? 0)}
                unit="개"
                iconTone="text-blue-600"
              />
              <StatCard
                icon={<CheckCircle2 className="h-5 w-5" />}
                title="완료한 단기 챌린지 수"
                value={String(streak.completedFiniteChallengeCount ?? 0)}
                unit="개"
                iconTone="text-emerald-600"
              />
              <StatCard
                icon={<FileText className="h-5 w-5" />}
                title="작성한 전체 일지 수"
                value={String(streak.totalDiaryCount)}
                unit="개"
                iconTone="text-purple-600"
              />
              <StatCard
                icon={<Target className="h-5 w-5" />}
                title="완료한 전체 목표 수"
                value={String(streak.totalGoalCount)}
                unit="개"
                iconTone="text-pink-600"
              />
            </div>
          </section>

          <section>
            <Text
              size="display2"
              weight="bold"
              className="text-gray-900"
            >
              활동 기록
            </Text>
            <div className="mt-4">
              <Streak
                data={buildYearStreak(streak.calendar)}
                size={14}
                gap={6}
              />
            </div>
          </section>

          <section>
            <Text
              size="display2"
              weight="bold"
              className="text-gray-900"
            >
              진행 중인 챌린지
            </Text>

            {challengeList.length === 0 ? (
              <div
                className={cn(
                  'rounded-3 mt-4 border border-gray-200',
                  'p-6 text-center',
                )}
              >
                <Text
                  size="body1"
                  weight="medium"
                  className="text-gray-500"
                >
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
                      <div
                        key={ch.challengeId}
                        className="w-[320px] shrink-0"
                      >
                        <DSChallengeCard
                          challengeTitle={ch.title}
                          challengeType={formatChallengeCardTypeLabel(
                            ch.goalType,
                            ch.maxParticipantCnt
                          )}
                          challengeCategory={getCategoryLabel(
                            ch.category
                          )}
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

          <section>
            <div className="flex items-center justify-between">
              <Text
                size="display2"
                weight="bold"
                className="text-gray-900"
              >
                내 일지
              </Text>
              {hasMoreDiaries && (
                <Link
                  href="/mypage/diary"
                  className="text-main-800 text-sm font-semibold hover:underline"
                >
                  전체 보기
                </Link>
              )}
            </div>

            {recentDiaryCards.length === 0 ? (
              <div
                className={cn(
                  'rounded-3 mt-4 border border-gray-200',
                  'p-6 text-center',
                )}
              >
                <Text
                  size="body1"
                  weight="medium"
                  className="text-gray-500"
                >
                  작성한 일지가 없습니다.
                </Text>
              </div>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <div className="flex w-max gap-3 py-2">
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
                        commentCount={diary.commentCount}
                        onLikeToggle={() =>
                          handleDiaryLikeToggle(diary)
                        }
                        onClick={() =>
                          router.push(`/diary/${diary.id}`)
                        }
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
