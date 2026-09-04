'use client';

import { SectionHeader } from '@1d1s/design-system';
import ChallengeCard from '@component/cards/ChallengeCard';
import { ChallengeCardSkeleton } from '@component/skeletons/ChallengeCardSkeleton';
import { cn } from '@module/utils/cn';
import Link from 'next/link';
import React from 'react';

import { sectionMoreHref } from '../consts/challengeSections';
import type { ChallengeSectionResult } from '../hooks/useCategorySections';
import { toChallengeCardProps } from '../utils/challengeCardProps';

/**
 * 챌린지 탭 홈 — **카테고리별 가로 레일 섹션**.
 *
 * 레일은 화면 끝까지 흐른다(full bleed). 여백 안에서 끊기면 스크롤되는 줄로
 * 안 읽힌다 — 마지막 카드가 가장자리에서 잘려 이어져야 "옆에 더 있다"가
 * 보인다. 그래서 목록에는 좌우 여백을 주지 않고 **줄마다** 16px 를 준다.
 *
 * 데스크톱(lg+)에서는 가로 스크롤 대신 한 줄 그리드로 편다 — 마우스로
 * 가로 스크롤은 불편하고, 넓은 화면에서는 다섯 장이 그냥 다 들어간다.
 * 구성(카테고리별 분류)은 그대로다.
 *
 * 앱 수치: 카드 240 · 카드 간격 10 · 좌우 거터 16 · 섹션 간격 24.
 */

const RAIL_GUTTER = 'px-4 lg:px-0';
const CARD_WIDTH = 'w-[240px]';

function SectionShell({
  label,
  moreHref,
  children,
}: {
  label: string;
  moreHref?: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <section className="pb-6">
      {/* 헤더는 여백 안이다 — 제목이 화면 끝에 붙으면 읽기 어렵다. */}
      <div className={RAIL_GUTTER}>
        <SectionHeader
          title={label}
          // 앱 kSectionTitleStyle(size2xl extrabold / letterSpacing -0.5)에
          // 맞춘다. 홈·탐색 섹션이 쓰는 것과 같은 클래스다 — 같은 자리에
          // 같은 뜻으로 서는 것이 화면마다 다르면 고칠 때도 여러 번 고친다.
          className="[&_h2]:!text-2xl [&_h2]:!tracking-tight"
          // onActionClick 이 아니라 진짜 <a href> 를 넘긴다 — 크롤러가
          // 카테고리 페이지로 따라 들어가야 그쪽이 색인된다.
          action={
            moreHref ? (
              <Link
                href={moreHref}
                className={cn(
                  // 앱은 브랜드색 bold 다(AppColors.brand). 회색으로 두면
                  // 누를 수 있는 자리로 안 읽힌다.
                  'text-brand shrink-0 text-[14px] font-bold',
                  'transition hover:brightness-110'
                )}
              >
                전체보기 →
              </Link>
            ) : undefined
          }
        />
      </div>
      {children}
    </section>
  );
}

/** 카드 줄. 모바일은 가로 레일, lg+ 는 한 줄 그리드. */
function SectionRail({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div
      className={cn(
        'scrollbar-hide mt-3 flex gap-[10px] overflow-x-auto',
        RAIL_GUTTER,
        'lg:grid lg:grid-cols-5 lg:overflow-visible'
      )}
    >
      {children}
    </div>
  );
}

export function ChallengeCategorySectionsSkeleton(): React.ReactElement {
  // 실제 줄과 **같은 골격**이다 — 제목 줄 하나에 카드 레일 하나.
  // 다르면 교차하는 순간 자리가 어긋난다.
  return (
    <div data-skeleton-group>
      {[0, 1, 2].map((row) => (
        <section key={row} className="pb-6">
          {/* 제목 자리도 실제와 같은 높이다 — 다르면 교차하는 순간
              몇 px 어긋나 아래가 밀린다. */}
          <div className={cn(RAIL_GUTTER, 'flex h-8 items-center')}>
            <div className="h-[19px] w-28 rounded bg-gray-100" />
          </div>
          <SectionRail>
            {[0, 1, 2, 3, 4].map((index) => (
              <div
                key={index}
                className={cn(CARD_WIDTH, 'shrink-0 lg:w-auto lg:shrink')}
              >
                <ChallengeCardSkeleton />
              </div>
            ))}
          </SectionRail>
        </section>
      ))}
    </div>
  );
}

interface ChallengeCategorySectionsProps {
  sections: ChallengeSectionResult[];
  /** 목록 맨 위에 얹을 것(카테고리 칩 줄). */
  header?: React.ReactNode;
}

export function ChallengeCategorySections({
  sections,
  header,
}: ChallengeCategorySectionsProps): React.ReactElement {
  return (
    <div>
      {header ? <div className="pb-5">{header}</div> : null}
      {sections.map(({ section, items }) => (
        <SectionShell
          key={section.id}
          label={section.label}
          moreHref={sectionMoreHref(section)}
        >
          <SectionRail>
            {items.map((challenge) => (
              <div
                key={challenge.challengeId}
                className={cn(CARD_WIDTH, 'shrink-0 lg:w-auto lg:shrink')}
              >
                <ChallengeCard
                  {...toChallengeCardProps(
                    challenge,
                    `/challenge/${challenge.challengeId}`
                  )}
                />
              </div>
            ))}
          </SectionRail>
        </SectionShell>
      ))}
    </div>
  );
}

/** 카테고리 빠른 선택 칩 — 아래로 안 내려가고도 원하는 줄로 바로 간다. */
export function ChallengeCategoryChips({
  categories,
}: {
  categories: ReadonlyArray<{ value: string; label: string }>;
}): React.ReactElement {
  return (
    <div
      className={cn(
        'scrollbar-hide flex gap-2 overflow-x-auto',
        RAIL_GUTTER,
        'lg:flex-wrap lg:overflow-visible'
      )}
    >
      {categories.map((category) => (
        <Link
          key={category.value}
          href={`/challenge/category/${category.value}`}
          className={cn(
            'shrink-0 rounded-full border border-gray-200 bg-white',
            'px-3 py-1.5 text-[13px] font-bold text-gray-700',
            'transition hover:border-gray-300 hover:bg-gray-50'
          )}
        >
          {category.label}
        </Link>
      ))}
    </div>
  );
}
