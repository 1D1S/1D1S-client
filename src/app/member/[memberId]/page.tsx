'use client';

import { Text } from '@1d1s/design-system';
import { useMemberDiaries } from '@feature/diary/board/hooks/useDiaryQueries';
import { useMemberProfile } from '@feature/member/hooks/useMemberQueries';
import { MyPageActiveChallenges } from '@feature/member/mypage/components/MyPageActiveChallenges';
import { MyPageActivityHeatmap } from '@feature/member/mypage/components/MyPageActivityHeatmap';
import { MyPageBadgesSection } from '@feature/member/mypage/components/MyPageBadgesSection';
import { MyPageDiarySection } from '@feature/member/mypage/components/MyPageDiarySection';
import { MyPageHeroBanner } from '@feature/member/mypage/components/MyPageHeroBanner';
import { MyPageProfileCard } from '@feature/member/mypage/components/MyPageProfileCard';
import { MyPageStatSection } from '@feature/member/mypage/components/MyPageStatSection';
import { MyPageStreakHeroCard } from '@feature/member/mypage/components/MyPageStreakHeroCard';
import { normalizeApiError } from '@module/api/error';
import { cn } from '@module/utils/cn';
import { UserPlus } from 'lucide-react';
import { useParams } from 'next/navigation';
import React from 'react';

function MemberProfileActions(): React.ReactElement {
  return (
    <div className="group relative">
      <button
        type="button"
        disabled
        className={cn(
          'flex cursor-not-allowed items-center gap-2 rounded-xl',
          'border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-400',
        )}
      >
        <UserPlus className="h-4 w-4" />
        <Text size="body1" weight="bold">
          친구 추가
        </Text>
      </button>
      <div
        className={cn(
          'pointer-events-none absolute bottom-full left-1/2 mb-2',
          '-translate-x-1/2 rounded-lg bg-gray-800 px-3 py-1.5',
          'text-xs whitespace-nowrap text-white opacity-0',
          'transition-opacity group-hover:opacity-100',
        )}
      >
        곧 추가될 기능입니다!
      </div>
    </div>
  );
}

export default function MemberProfilePage(): React.ReactElement {
  const params = useParams();
  const memberId = Number(params.memberId);
  const { data, isLoading, isError, error } = useMemberProfile(memberId);
  const { data: memberDiariesData } = useMemberDiaries(memberId, 10);

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

  const { nickname, profileUrl, streak, challengeList } = data;
  const memberDiaries = memberDiariesData?.items ?? [];
  const hasMoreDiaries = memberDiariesData?.pageInfo.hasNextPage ?? false;

  return (
    <div className="min-h-screen w-full bg-gray-50 pb-12">
      <MyPageHeroBanner />

      <div
        className={cn(
          'mx-auto w-full max-w-[1200px]',
          'px-5 lg:px-8',
        )}
      >
        <MyPageProfileCard
          nickname={nickname}
          profileUrl={profileUrl}
          totalDiaryCount={streak.totalDiaryCount}
          totalChallengeCount={streak.totalChallengeCount ?? 0}
          completedFiniteChallengeCount={
            streak.completedFiniteChallengeCount ?? 0
          }
          actions={<MemberProfileActions />}
        />

        <div
          className={cn(
            'mt-6 grid grid-cols-1 gap-4',
            'lg:grid-cols-2 lg:gap-5',
          )}
        >
          <MyPageStreakHeroCard
            currentStreak={streak.currentStreak}
            maxStreak={streak.maxStreak}
          />
          <MyPageActivityHeatmap calendar={streak.calendar} />
        </div>

        <div className="mt-8">
          <MyPageStatSection streak={streak} />
        </div>

        <div className="mt-8">
          <MyPageBadgesSection streak={streak} />
        </div>

        <div className="mt-8">
          <MyPageActiveChallenges challengeList={challengeList} />
        </div>

        <div className="mt-8">
          <MyPageDiarySection
            title={`${nickname}님의 일지`}
            diaries={memberDiaries}
            nickname={nickname}
            hasMore={hasMoreDiaries}
            viewAllHref={`/member/${memberId}/diary`}
            emptyMessage="작성한 일지가 없습니다."
          />
        </div>
      </div>
    </div>
  );
}
