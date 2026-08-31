'use client';

import { Text } from '@1d1s/design-system';
import { getCategoryLabel } from '@constants/categories';
import { formatChallengeTypeLabel } from '@feature/challenge/shared/utils/challengeDisplay';
import type { PublicChallengeMeta } from '@module/metadata/seo';
import { cn } from '@module/utils/cn';
import React from 'react';

import type { ChallengeCategory } from '../../board/type/challenge';
import { buildHeroGradient, getCategoryAccent } from '../utils/challengeAccent';
import { formatDateRange } from '../utils/challengeLabels';
import { ChallengeDetailHero } from './ChallengeDetailHero';

interface ChallengeDetailPreviewProps {
  challenge: PublicChallengeMeta;
}

/**
 * 상세 페이지의 **초기 HTML 콘텐츠**.
 *
 * ChallengeDetailScreen 은 useSearchParams(?tab) 을 쓰는 클라이언트 화면이라
 * 정적 렌더에서 CSR bailout 이 걸린다 — 즉 Suspense fallback 이 그대로
 * 초기 HTML 이 되고, 지금까지는 그게 스켈레톤뿐이라 크롤러가 제목·설명이
 * 없는 빈 페이지를 봤다("크롤됨-현재 색인 안 됨").
 *
 * 그래서 fallback 을 비인증 GET /challenges/{id} 로 채운 실제 콘텐츠로
 * 바꾼다. 공개 정보(제목·설명·카테고리·기간·참여자 수)만 담고, 참여 상태·
 * 목표·일지 등 인증이 필요한 부분은 하이드레이션 후 화면이 채운다.
 * 비공개(PRIVATE)·조회 실패는 호출부에서 스켈레톤으로 폴백한다.
 *
 * 'use client' 인 이유: 히어로/카테고리 라벨이 design-system 을 쓰는데,
 * 이 패키지는 RSC 에서 import 하면 빌드가 깨진다. fallback 은 서버에서
 * 렌더되므로 클라이언트 컴포넌트여도 초기 HTML 에 그대로 실린다.
 */
export function ChallengeDetailPreview({
  challenge,
}: ChallengeDetailPreviewProps): React.ReactElement {
  const accent = getCategoryAccent(
    (challenge.category ?? undefined) as ChallengeCategory | undefined
  );
  const description = challenge.description?.trim();
  const period =
    challenge.startDate && challenge.endDate
      ? formatDateRange(challenge.startDate, challenge.endDate)
      : null;
  const participants =
    typeof challenge.participantCnt === 'number'
      ? `${challenge.participantCnt}명 참여`
      : null;
  const metaLabel = [period, participants].filter(Boolean).join(' · ');

  return (
    <div className={cn('min-h-screen w-full bg-white', 'pb-12')}>
      <ChallengeDetailHero
        title={challenge.title}
        categoryLabel={getCategoryLabel(challenge.category)}
        category={challenge.category}
        typeLabel={`${formatChallengeTypeLabel(challenge.goalType)} 챌린지`}
        metaLabel={metaLabel}
        imageUrl={challenge.thumbnailImage}
        accent={accent}
        gradient={buildHeroGradient(accent)}
        bleed
      />
      {description ? (
        <div
          className={cn(
            'mx-auto flex w-full max-w-[1200px] flex-col gap-3',
            'px-5 pt-6 md:px-6 lg:px-8'
          )}
        >
          <section
            className={cn(
              'rounded-[14px] border border-gray-100 bg-gray-50',
              'p-4 sm:p-5 lg:border-gray-200 lg:bg-white lg:p-6'
            )}
          >
            <Text as="h2" size="body1" weight="bold" className="mb-3">
              챌린지 소개
            </Text>
            <Text
              as="p"
              size="body2"
              className="break-keep whitespace-pre-wrap text-gray-700"
            >
              {description}
            </Text>
          </section>
        </div>
      ) : null}
    </div>
  );
}
