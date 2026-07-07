'use client';

import { Text } from '@1d1s/design-system';
import ChallengeCard from '@component/cards/ChallengeCard';
import EmptyState from '@component/EmptyState';
import { ChallengeCardSkeletonGrid } from '@component/skeletons/ChallengeCardSkeleton';
import {
  CategoryIcon,
  getCategoryLabel,
  getCategoryStripeTone,
} from '@constants/categories';
import { normalizeApiError } from '@module/api/error';
import { cn } from '@module/utils/cn';
import { useMinimumLoading } from '@module/utils/useMinimumLoading';
import { ArrowLeft } from 'lucide-react';
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
    <div className="min-h-screen w-full">
      {/* 모바일 sticky 헤더 — ← + 챌린지 전체 보기 */}
      <div
        className={cn(
          'sticky top-0 z-30 flex items-center gap-3',
          'h-14-safe pt-safe-top',
          'border-b border-gray-100 bg-white/95 px-4 backdrop-blur',
          'lg:hidden'
        )}
      >
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => router.push(`/member/${memberId}`)}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg',
            'text-gray-700 transition-colors hover:bg-gray-100'
          )}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Text
          size="heading2"
          weight="extrabold"
          className="flex-1 tracking-[-0.3px] text-gray-900"
        >
          챌린지 전체 보기
        </Text>
      </div>

      <div
        className={cn(
          'mx-auto w-full max-w-[1200px]',
          'px-5 py-5 lg:px-8 lg:py-10'
        )}
      >
        <header
          className={cn(
            'hidden flex-col gap-4 border-b border-gray-100 pb-5',
            'lg:flex lg:flex-row lg:items-end lg:justify-between'
          )}
        >
          <div className="flex flex-col gap-1.5">
            <Text
              size="pageTitle"
              weight="extrabold"
              className="tracking-tight text-gray-900"
            >
              챌린지 전체 보기
            </Text>
            <Text size="body2" weight="regular" className="text-gray-500">
              참여 중인 챌린지 전체 목록입니다.
            </Text>
          </div>
        </header>

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
      </div>
    </div>
  );
}
