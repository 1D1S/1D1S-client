'use client';

import { Text } from '@1d1s/design-system';
import ChallengeCard, {
  type ChallengeCardGoalType,
} from '@component/cards/ChallengeCard';
import EmptyState from '@component/EmptyState';
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
import { ArrowLeft } from 'lucide-react';
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
    <div className="min-h-screen w-full">
      {/* 모바일 sticky 헤더 — ← + 내 챌린지 전체 보기 */}
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
          onClick={() => router.push('/mypage')}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg',
            'text-gray-700 transition-colors hover:bg-gray-100'
          )}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Text
          size="body1"
          weight="extrabold"
          className="flex-1 tracking-[-0.3px] text-gray-900"
        >
          내 챌린지 전체 보기
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
              내 챌린지 전체 보기
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

        {!showSkeleton && hasChallenges ? (
          <div
            className={cn(
              'data-fade-in mt-6 grid gap-4',
              'grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4'
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
      </div>
    </div>
  );
}
