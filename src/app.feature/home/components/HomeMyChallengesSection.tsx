'use client';

import { Button, SectionHeader } from '@1d1s/design-system';
import FadeInImage from '@component/FadeInImage';
import { Skeleton } from '@component/Skeleton';
import { CategoryIcon, getCategoryStripeTone } from '@constants/categories';
import { isInfiniteChallengeEndDate } from '@feature/challenge/board/utils/challengePeriod';
import type { SidebarChallenge } from '@feature/member/type/member';
import { cn } from '@module/utils/cn';
import { loginUrlFromCurrentLocation } from '@module/utils/returnTo';
import Link from 'next/link';
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

// 로그인/로딩/빈 상태/CTA 가 모두 같은 높이를 차지하도록 body 영역 높이를
// 예약해, 인증 상태가 확정되며 콘텐츠가 바뀌어도 레이아웃 시프트가 없게 한다.
const BODY_MIN = 'min-h-[168px]';

const CARD_ITEM = 'w-[128px] shrink-0';

function CompactCardThumb({
  challenge,
}: {
  challenge: SidebarChallenge;
}): React.ReactElement {
  return (
    <div className="bg-main-100 relative aspect-[4/3] overflow-hidden rounded-lg">
      {challenge.thumbnailImage ? (
        <FadeInImage
          src={challenge.thumbnailImage}
          alt={challenge.title}
          fill
          sizes="128px"
          className="object-cover"
        />
      ) : (
        <span
          className={cn(
            'absolute inset-0 flex items-center justify-center text-white',
            '[&_svg]:!h-6 [&_svg]:!w-6'
          )}
          style={{ backgroundColor: getCategoryStripeTone(challenge.category) }}
          aria-hidden
        >
          <CategoryIcon category={challenge.category} className="h-6 w-6" />
        </span>
      )}
    </div>
  );
}

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
        title="내가 참여한 챌린지"
        subtitle="바로 이어서 도전해보세요"
        actionLabel={showList ? '전체보기 →' : undefined}
        onActionClick={showList ? () => router.push('/challenge') : undefined}
        className="[&_h2]:!text-2xl [&_h2]:!tracking-tight"
      />

      {/* 비로그인 CTA */}
      {!isLoggedIn ? (
        <button
          type="button"
          onClick={() => router.push(loginUrlFromCurrentLocation())}
          aria-label="로그인하고 내 챌린지 확인하기"
          className={cn(
            'rounded-3 mt-4 flex w-full flex-col justify-center gap-2',
            BODY_MIN,
            'from-main-100 via-main-200/40 to-main-200 bg-gradient-to-br',
            'group cursor-pointer p-5 text-left transition',
            'hover:brightness-105'
          )}
        >
          <span className="text-[15px] font-extrabold tracking-tight text-gray-900">
            로그인하고 내 챌린지 확인하기
          </span>
          <span className="text-[12px] text-gray-600">
            참여 중인 챌린지를 홈에서 바로 이어가세요.
          </span>
          <span
            className={cn(
              'mt-1 inline-flex items-center self-start rounded-full',
              'bg-brand px-3 py-1 text-[11px] font-bold text-white'
            )}
          >
            로그인하기 →
          </span>
        </button>
      ) : null}

      {/* 로딩 스켈레톤 — 리스트와 동일 높이 */}
      {isLoggedIn && isLoading ? (
        <div
          className={cn(
            '-mx-5 mt-4 flex gap-3 overflow-x-auto px-5 py-2',
            'scrollbar-hide',
            BODY_MIN
          )}
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className={CARD_ITEM}>
              <Skeleton shape="rounded" className="aspect-[4/3] w-full" />
              <Skeleton shape="text" className="mt-2 h-4 w-4/5" />
              <Skeleton shape="text" className="mt-1.5 h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : null}

      {/* 로그인 + 진행 중 챌린지 리스트 */}
      {showList ? (
        <div
          className={cn(
            '-mx-5 mt-4 flex gap-3 overflow-x-auto px-5 py-2',
            'scrollbar-hide data-fade-in',
            BODY_MIN
          )}
        >
          {ongoing.map((challenge) => {
            const isInfinite = isInfiniteChallengeEndDate(challenge.endDate);
            const remainingLabel = formatChallengeRemainingLabel(
              challenge.endDate,
              isInfinite,
              false
            );

            return (
              <Link
                key={challenge.challengeId}
                href={`/challenge/${challenge.challengeId}`}
                aria-label={`${challenge.title} 챌린지 보기`}
                className={cn(CARD_ITEM, 'group')}
              >
                <CompactCardThumb challenge={challenge} />
                <p
                  className={cn(
                    'mt-2 line-clamp-2 min-h-[2.4em] text-[13px]',
                    'leading-tight font-semibold text-gray-800',
                    'group-hover:text-main-800 transition-colors'
                  )}
                >
                  {challenge.title}
                </p>
                <span className="text-brand mt-0.5 block text-[11px] font-bold">
                  {remainingLabel}
                </span>
              </Link>
            );
          })}
        </div>
      ) : null}

      {/* 로그인 + 진행 중 0개 빈 상태 */}
      {isLoggedIn && !isLoading && ongoing.length === 0 ? (
        <div
          className={cn(
            'mt-4 flex w-full flex-col items-center justify-center gap-3',
            BODY_MIN,
            'rounded-3 border-main-200 border border-dashed p-5 text-center'
          )}
        >
          <p className="text-[13px] text-gray-600">
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
