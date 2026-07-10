'use client';

import ChallengeCard, {
  type ChallengeCardGoalType,
} from '@component/cards/ChallengeCard';
import EmptyState from '@component/EmptyState';
import { BoardScreenLayout } from '@component/layout/BoardScreenLayout';
import { MobileHeader } from '@component/layout/MobileHeader';
import { ChallengeCardSkeletonGrid } from '@component/skeletons/ChallengeCardSkeleton';
import {
  CategoryIcon,
  getCategoryLabel,
  getCategoryStripeTone,
} from '@constants/categories';
import { useMyPage } from '@feature/member/hooks/useMemberQueries';
import type { MyPageChallenge } from '@feature/member/type/member';
import { cn } from '@module/utils/cn';
import { useMinimumLoading } from '@module/utils/useMinimumLoading';
import { useRouter } from 'next/navigation';
import React from 'react';

import {
  formatChallengeRemainingLabel,
  isChallengeEndedOrArchived,
  isInfiniteChallengeEndDate,
} from '../utils/challengePeriod';

interface MyChallengeCardItemProps {
  challenge: MyPageChallenge;
}

// MyPageActiveChallenges 와 동일한 매핑. React.memo(ChallengeCard) 가
// 재렌더를 건너뛰도록 파생 계산을 컴포넌트로 분리한다.
const MyChallengeCardItem = React.memo(
  ({ challenge }: MyChallengeCardItemProps): React.ReactElement => {
    const isInfinite = isInfiniteChallengeEndDate(challenge.endDate);
    const ended = isChallengeEndedOrArchived(
      challenge.endDate,
      challenge.participantCnt
    );
    const remainingLabel = formatChallengeRemainingLabel(
      challenge.endDate,
      isInfinite,
      ended
    );

    return (
      <ChallengeCard
        title={challenge.title}
        category={getCategoryLabel(challenge.category)}
        categoryIcon={
          <CategoryIcon category={challenge.category} className="h-3 w-3" />
        }
        stripeTone={getCategoryStripeTone(challenge.category)}
        imageUrl={challenge.thumbnailImage}
        currentParticipantCount={challenge.participantCnt}
        maxParticipantCount={challenge.maxParticipantCnt}
        remainingLabel={remainingLabel}
        startDate={challenge.startDate}
        endDate={challenge.endDate}
        isInfinite={isInfinite}
        goalType={challenge.goalType as ChallengeCardGoalType}
        isGroup={challenge.participationType === 'GROUP'}
        isEnded={ended}
        isPhotoRequired={challenge.photoRequired}
        participants={challenge.randomParticipants}
        href={`/challenge/${challenge.challengeId}`}
      />
    );
  }
);
MyChallengeCardItem.displayName = 'MyChallengeCardItem';

// ponytail: /member/my-page 의 challengeList(참여 중 챌린지)를 그대로 사용.
// 내 memberId 가 클라이언트에 없어 /challenges/member 를 호출할 수 없고,
// 완료 포함 "전체" 가 필요하면 백엔드 self 챌린지 목록 엔드포인트가 필요.
export function MyChallengeListScreen(): React.ReactElement {
  const router = useRouter();
  const { data, isLoading } = useMyPage();
  const showSkeleton = useMinimumLoading(isLoading);

  const challenges = data?.challengeList ?? [];
  const hasChallenges = challenges.length > 0;

  return (
    <BoardScreenLayout
      title="내 챌린지 전체 보기"
      description="참여 중인 챌린지 전체 목록입니다."
      mobileHeader={
        <MobileHeader
          title="내 챌린지 전체 보기"
          onBack={() => router.push('/mypage')}
        />
      }
    >
      {showSkeleton ? (
        <ChallengeCardSkeletonGrid
          count={8}
          className="data-fade-in mt-6 gap-4"
        />
      ) : null}

      {!showSkeleton && hasChallenges ? (
        <div
          className={cn(
            'data-fade-in mt-6 grid gap-4',
            'xs:grid-cols-2 grid-cols-1 sm:grid-cols-3'
          )}
        >
          {challenges.map((challenge) => (
            <MyChallengeCardItem
              key={challenge.challengeId}
              challenge={challenge}
            />
          ))}
        </div>
      ) : null}

      {!showSkeleton && !hasChallenges ? (
        <EmptyState
          variant="challenge"
          title="참여 중인 챌린지가 없어요"
          className="mt-10"
        />
      ) : null}
    </BoardScreenLayout>
  );
}
