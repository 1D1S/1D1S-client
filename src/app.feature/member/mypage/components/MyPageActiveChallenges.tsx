'use client';

import { ProgressBar, Text } from '@1d1s/design-system';
import { getCategoryLabel } from '@constants/categories';
import {
  isInfiniteChallengeEndDate,
} from '@feature/challenge/board/utils/challengePeriod';
import type { MyPageChallenge } from '@feature/member/type/member';
import { cn } from '@module/utils/cn';
import { useRouter } from 'next/navigation';
import React from 'react';

import { getChallengeProgressInfo } from '../utils/mypageUtils';
import { MyPageSectionHeader } from './MyPageSectionHeader';

interface MiniChallengeCardProps {
  challenge: MyPageChallenge;
  onClick(): void;
}

function MiniChallengeCard({
  challenge,
  onClick,
}: MiniChallengeCardProps): React.ReactElement {
  const isInfinite = isInfiniteChallengeEndDate(challenge.endDate);
  const { progress, daysElapsed, totalDays } = getChallengeProgressInfo(
    challenge.startDate,
    challenge.endDate,
    isInfinite,
  );
  const categoryLabel = getCategoryLabel(challenge.category) || '챌린지';
  const dayMeta = isInfinite
    ? `${daysElapsed}일째 진행 중`
    : `${daysElapsed}/${totalDays}일`;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group rounded-3 flex flex-col gap-3 border border-gray-200',
        'bg-white p-4 text-left transition',
        'hover:border-main-300 hover:shadow-sm',
      )}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center',
            'rounded-2 bg-main-200/50 text-main-800',
          )}
        >
          <span className="text-sm font-extrabold">
            {categoryLabel.charAt(0)}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <Text
            size="body1"
            weight="bold"
            className="line-clamp-1 text-gray-900"
          >
            {challenge.title}
          </Text>
          <Text size="caption2" weight="medium" className="text-gray-500">
            {categoryLabel} · {dayMeta}
          </Text>
        </div>
      </div>
      <ProgressBar
        value={progress}
        thickness={6}
        infinite={isInfinite}
        showValueText={false}
      />
    </button>
  );
}

interface MyPageActiveChallengesProps {
  challengeList: MyPageChallenge[];
}

/**
 * 진행 중인 챌린지 — 디자인 B 의 3-column 미니 카드 그리드.
 * 카테고리 아이콘 박스 + 제목 + 일자 메타 + ProgressBar.
 */
export function MyPageActiveChallenges({
  challengeList,
}: MyPageActiveChallengesProps): React.ReactElement {
  const router = useRouter();

  return (
    <section>
      <MyPageSectionHeader
        title="진행 중인 챌린지"
        subtitle={`${challengeList.length}개 참여 중`}
      />

      {challengeList.length === 0 ? (
        <div
          className={cn(
            'rounded-3 mt-4 border border-gray-200 p-6 text-center',
          )}
        >
          <Text size="body1" weight="medium" className="text-gray-500">
            진행 중인 챌린지가 없습니다.
          </Text>
        </div>
      ) : (
        <div
          className={cn(
            'mt-4 grid grid-cols-1 gap-3',
            'sm:grid-cols-2 lg:grid-cols-3',
          )}
        >
          {challengeList.map((challenge) => (
            <MiniChallengeCard
              key={challenge.challengeId}
              challenge={challenge}
              onClick={() =>
                router.push(`/challenge/${challenge.challengeId}`)
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}
