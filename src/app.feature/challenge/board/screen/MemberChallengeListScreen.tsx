'use client';

import { MobileHeader, Text } from '@1d1s/design-system';
import ChallengeCard from '@component/cards/ChallengeCard';
import EmptyState from '@component/EmptyState';
import { BoardScreenLayout } from '@component/layout/BoardScreenLayout';
import { ChallengeCardSkeletonGrid } from '@component/skeletons/ChallengeCardSkeleton';
import {
  CategoryIcon,
  getCategoryLabel,
  getCategoryStripeTone,
} from '@constants/categories';
import { normalizeApiError } from '@module/api/error';
import { cn } from '@module/utils/cn';
import { useMinimumLoading } from '@module/utils/useMinimumLoading';
import { useRouter } from 'next/navigation';
import React from 'react';

import { useMemberChallenges } from '../hooks/useChallengeQueries';
import type { ChallengeListItem } from '../type/challenge';
import {
  formatChallengeRemainingLabel,
  isChallengeEndedOrArchived,
  isInfiniteChallengeEndDate,
} from '../utils/challengePeriod';

interface MemberChallengeCardItemProps {
  challenge: ChallengeListItem;
}

// 보드와 동일한 매핑. React.memo(ChallengeCard) 가 재렌더를 건너뛰도록
// 파생 계산을 컴포넌트로 분리한다.
const MemberChallengeCardItem = React.memo(
  ({ challenge }: MemberChallengeCardItemProps): React.ReactElement => {
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
        goalType={challenge.goalType}
        isGroup={challenge.participationType === 'GROUP'}
        isEnded={ended}
        isPhotoRequired={challenge.photoRequired}
        isOfficial={challenge.challengeType === 'OFFICIAL'}
        participants={challenge.randomParticipants}
        href={`/challenge/${challenge.challengeId}`}
      />
    );
  }
);
MemberChallengeCardItem.displayName = 'MemberChallengeCardItem';

interface MemberChallengeListScreenProps {
  memberId: string;
}

export function MemberChallengeListScreen({
  memberId,
}: MemberChallengeListScreenProps): React.ReactElement {
  const memberIdNum = Number(memberId);
  const router = useRouter();
  const { data, isLoading, isError, error } = useMemberChallenges(memberIdNum);
  const showSkeleton = useMinimumLoading(isLoading);

  const challenges = data ?? [];
  const hasChallenges = challenges.length > 0;

  return (
    <BoardScreenLayout
      title="챌린지 전체 보기"
      description="참여 중인 챌린지 전체 목록입니다."
      mobileHeader={
        <MobileHeader
          title="챌린지 전체 보기"
          onBack={() => router.push(`/member/${memberId}`)}
        />
      }
    >
      {showSkeleton ? (
        <ChallengeCardSkeletonGrid
          count={8}
          className="data-fade-in mt-6 gap-4"
        />
      ) : null}

      {isError && !hasChallenges ? (
        <div className="mt-10 flex w-full justify-center py-10">
          <Text size="body1" weight="medium" className="text-red-600">
            {error
              ? normalizeApiError(error).message
              : '챌린지를 불러오지 못했습니다.'}
          </Text>
        </div>
      ) : null}

      {!showSkeleton && hasChallenges ? (
        <div
          className={cn(
            'data-fade-in mt-6 grid gap-4',
            'xs:grid-cols-2 grid-cols-1 sm:grid-cols-3'
          )}
        >
          {challenges.map((challenge) => (
            <MemberChallengeCardItem
              key={challenge.challengeId}
              challenge={challenge}
            />
          ))}
        </div>
      ) : null}

      {!showSkeleton && !isError && !hasChallenges ? (
        <EmptyState
          variant="challenge"
          title="참여 중인 챌린지가 없어요"
          className="mt-10"
        />
      ) : null}
    </BoardScreenLayout>
  );
}
