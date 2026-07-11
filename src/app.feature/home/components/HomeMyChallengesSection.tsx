'use client';

import { Button, SectionHeader } from '@1d1s/design-system';
import ChallengeCard, {
  type ChallengeCardGoalType,
} from '@component/cards/ChallengeCard';
import { ChallengeCardSkeleton } from '@component/skeletons/ChallengeCardSkeleton';
import {
  CategoryIcon,
  getCategoryLabel,
  getCategoryStripeTone,
} from '@constants/categories';
import { isInfiniteChallengeEndDate } from '@feature/challenge/board/utils/challengePeriod';
import type { SidebarChallenge } from '@feature/member/type/member';
import { cn } from '@module/utils/cn';
import { loginUrlFromCurrentLocation } from '@module/utils/returnTo';
import { useRouter } from 'next/navigation';
import React from 'react';

import {
  formatChallengeRemainingLabel,
  isChallengeEndedOrArchived,
} from '../utils/homeFormatters';

interface HomeMyChallengesSectionProps {
  challenges: SidebarChallenge[];
  isLoggedIn: boolean;
  /** sidebar 인증/데이터가 아직 확정되지 않은 구간 — 스켈레톤을 노출한다. */
  isLoading: boolean;
}

// 리스트/스켈레톤/빈 상태/비로그인 CTA 4개 상태가 모두 같은 높이를 차지하도록
// ChallengeCard 실제 높이(썸네일 21/9 + 제목 2줄 클램프 + 고정 메타 ≈ 280px)에
// 맞춰 영역 높이를 예약한다. 카드보다 살짝 크게 잡아 CTA 가 카드보다 낮아지며
// 생기는 시프트를 막는다(넉넉한 쪽은 중앙 정렬이라 눈에 띄지 않는다).
const ROW_MIN = 'min-h-[288px]';

// 모바일에서 다음 카드가 살짝 보이도록(peek) 카드 폭을 고정한다.
const CARD_ITEM = 'w-[260px] shrink-0 snap-start';

// "나의 활동" 패널 내부에 놓이므로 화면 끝까지 breakout 하지 않는다. 스크롤
// 컨테이너는 패널 내부 패딩 라인에서 시작해(첫 카드 좌측 = 헤더·배너와 동일
// 세로선) 우측으로만 흐른다. py-2 는 카드 그림자 세로 여백 확보용.
const SCROLL_ROW = cn(
  'mt-4 flex gap-3 overflow-x-auto py-2',
  'scrollbar-hide snap-x snap-mandatory',
  ROW_MIN
);

export default function HomeMyChallengesSection({
  challenges,
  isLoggedIn,
  isLoading,
}: HomeMyChallengesSectionProps): React.ReactElement {
  const router = useRouter();

  // 진행 중 위주 — 종료/아카이브된 챌린지는 바로가기에서 제외한다.
  const ongoing = challenges.filter(
    (challenge) =>
      !isChallengeEndedOrArchived(challenge.endDate, challenge.participantCnt)
  );

  const showList = isLoggedIn && !isLoading && ongoing.length > 0;

  return (
    <section className="w-full">
      <SectionHeader
        size="sm"
        title="참여 중인 챌린지"
        actionLabel={showList ? '전체보기 →' : undefined}
        onActionClick={showList ? () => router.push('/challenge') : undefined}
      />

      {/* 비로그인 CTA — 리스트와 동일 높이 */}
      {!isLoggedIn ? (
        <button
          type="button"
          onClick={() => router.push(loginUrlFromCurrentLocation())}
          aria-label="로그인하고 내 챌린지 확인하기"
          className={cn(
            'rounded-3 mt-4 flex w-full flex-col justify-center gap-2',
            ROW_MIN,
            'from-main-100 via-main-200/40 to-main-200 bg-gradient-to-br',
            'group cursor-pointer p-6 text-left transition',
            'hover:brightness-105'
          )}
        >
          <span className="text-[17px] font-extrabold tracking-tight text-gray-900">
            로그인하고 내 챌린지 확인하기
          </span>
          <span className="text-[13px] text-gray-600">
            참여 중인 챌린지를 홈에서 바로 이어가세요.
          </span>
          <span
            className={cn(
              'mt-1 inline-flex items-center self-start rounded-full',
              'bg-brand px-3.5 py-1.5 text-[12px] font-bold text-white'
            )}
          >
            로그인하기 →
          </span>
        </button>
      ) : null}

      {/* 로딩 스켈레톤 — 카드와 동일 크기/높이 */}
      {isLoggedIn && isLoading ? (
        <div className={SCROLL_ROW}>
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className={CARD_ITEM}>
              <ChallengeCardSkeleton />
            </div>
          ))}
        </div>
      ) : null}

      {/* 로그인 + 진행 중 챌린지 리스트 */}
      {showList ? (
        <div className={cn(SCROLL_ROW, 'data-fade-in')}>
          {ongoing.map((challenge) => {
            const isInfinite = isInfiniteChallengeEndDate(challenge.endDate);
            const remainingLabel = formatChallengeRemainingLabel(
              challenge.endDate,
              isInfinite,
              false
            );

            return (
              <div key={challenge.challengeId} className={CARD_ITEM}>
                <ChallengeCard
                  title={challenge.title}
                  category={getCategoryLabel(challenge.category)}
                  categoryIcon={
                    <CategoryIcon
                      category={challenge.category}
                      className="h-3 w-3"
                    />
                  }
                  stripeTone={getCategoryStripeTone(challenge.category)}
                  imageUrl={challenge.thumbnailImage ?? undefined}
                  currentParticipantCount={challenge.participantCnt}
                  maxParticipantCount={challenge.maxParticipantCnt}
                  remainingLabel={remainingLabel}
                  startDate={challenge.startDate}
                  endDate={challenge.endDate}
                  isInfinite={isInfinite}
                  goalType={challenge.goalType as ChallengeCardGoalType}
                  isGroup={challenge.participationType === 'GROUP'}
                  isEnded={false}
                  href={`/challenge/${challenge.challengeId}`}
                />
              </div>
            );
          })}
        </div>
      ) : null}

      {/* 로그인 + 진행 중 0개 빈 상태 — 리스트와 동일 높이 */}
      {isLoggedIn && !isLoading && ongoing.length === 0 ? (
        <div
          className={cn(
            'mt-4 flex w-full flex-col items-center justify-center gap-3',
            ROW_MIN,
            'rounded-3 border-main-200 border border-dashed p-6 text-center'
          )}
        >
          <p className="text-[14px] text-gray-600">
            아직 참여 중인 챌린지가 없어요.
          </p>
          <Button size="sm" onClick={() => router.push('/challenge')}>
            챌린지 둘러보기
          </Button>
        </div>
      ) : null}
    </section>
  );
}
