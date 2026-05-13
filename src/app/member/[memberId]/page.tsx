'use client';

import { Text } from '@1d1s/design-system';
import { useMemberDiaries } from '@feature/diary/board/hooks/useDiaryQueries';
import { MemberFriendActionButton } from '@feature/friend/components/MemberFriendActionButton';
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
import { useParams } from 'next/navigation';
import React from 'react';

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
    <div className="min-h-screen w-full bg-white pb-12 lg:bg-gray-50">
      <div className="hidden lg:block">
        <MyPageHeroBanner />
      </div>

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
          actions={<MemberFriendActionButton memberId={memberId} />}
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
