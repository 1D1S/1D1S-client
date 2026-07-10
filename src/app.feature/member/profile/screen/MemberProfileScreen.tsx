'use client';

import { MobileHeader, Text } from '@1d1s/design-system';
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
import { useSafeBack } from '@module/hooks/useSafeBack';
import { cn } from '@module/utils/cn';
import React from 'react';

interface MemberProfileScreenProps {
  memberId: number;
}

function MobileBackHeader({ title }: { title: string }): React.ReactElement {
  // 알림 딥링크/콜드 스타트로 진입해 history 가 없을 때 홈으로 보낸다.
  const handleBack = useSafeBack('/');
  return <MobileHeader title={title} onBack={handleBack} />;
}

export default function MemberProfileScreen({
  memberId,
}: MemberProfileScreenProps): React.ReactElement {
  const { data, isLoading, isError, error } = useMemberProfile(memberId);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-white">
        <MobileBackHeader title="프로필" />
        <div className="flex min-h-[60vh] items-center justify-center">
          <Text size="body1" weight="medium" className="text-gray-500">
            불러오는 중...
          </Text>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    const message = isError ? normalizeApiError(error).message : '';
    const isPrivate = message.includes('비공개');
    return (
      <div className="min-h-screen w-full bg-white">
        <MobileBackHeader title="프로필" />
        <div className="flex min-h-[60vh] items-center justify-center">
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
      </div>
    );
  }

  const {
    nickname,
    profileUrl,
    streak,
    challengeList,
    diaryList,
    relationStatus,
    isAccessible,
  } = data;
  const memberDiaries = diaryList?.items ?? [];
  const hasMoreDiaries = diaryList?.pageInfo?.hasNextPage ?? false;

  return (
    <div className="min-h-screen w-full bg-white">
      <MobileBackHeader title={nickname} />
      <div className="hidden lg:block">
        <MyPageHeroBanner />
      </div>

      <div
        className={cn(
          'mx-auto w-full max-w-[1200px]',
          'px-5 py-5 lg:px-8 lg:py-10'
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
          challengeHref={`/member/${memberId}/challenge`}
          diaryHref={`/member/${memberId}/diary`}
          actions={
            <MemberFriendActionButton
              memberId={memberId}
              relationStatus={relationStatus}
            />
          }
        />

        {isAccessible ? (
          <>
            <div
              className={cn(
                'mt-6 grid grid-cols-1 gap-4',
                'lg:grid-cols-2 lg:gap-5'
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
          </>
        ) : (
          <div
            className={cn(
              'rounded-3 mt-8 border border-gray-200 p-8 text-center'
            )}
          >
            <Text size="body1" weight="medium" className="text-gray-500">
              비공개 프로필입니다. 친구가 되면 활동을 볼 수 있어요.
            </Text>
          </div>
        )}
      </div>
    </div>
  );
}
