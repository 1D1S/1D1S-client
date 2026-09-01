'use client';

import { Tag, Text } from '@1d1s/design-system';
import { Skeleton } from '@component/Skeleton';
import { getCategoryLabel } from '@constants/categories';
import { formatChallengeTypeLabel } from '@feature/challenge/shared/utils/challengeDisplay';
import type { PublicChallengeMeta } from '@module/metadata/seo';
import { cn } from '@module/utils/cn';
import React from 'react';

import type { ChallengeCategory } from '../../board/type/challenge';
import { buildHeroGradient, getCategoryAccent } from '../utils/challengeAccent';
import { buildChallengeHeroMeta } from '../utils/challengeLabels';
import { ChallengeDetailHero } from './ChallengeDetailHero';

interface ChallengeDetailPreviewProps {
  challenge: PublicChallengeMeta;
}

/**
 * 상세 페이지의 **초기 HTML 콘텐츠**.
 *
 * 자리 예약은 전부 `pulse={false}` 다. 이미 제목·기간·소개가 실제로 보이는
 * 화면에서 placeholder 만 깜빡이면, 사용자에게는 로딩이 아니라 "화면이
 * 반짝인다"로 읽힌다(실기 피드백).
 *
 * ChallengeDetailScreen 은 인증이 필요한 데이터를 클라이언트에서 받아오므로
 * 그 사이 화면이 비어 있었고, SSR 결과 = 크롤러가 보는 전부가 스켈레톤뿐이라
 * 색인에서 빈 페이지로 취급됐다. 그래서 비인증 GET /challenges/{id} 로 읽은
 * 공개 정보(제목·기간·참여자 수·소개)를 여기서 실제로 렌더한다.
 *
 * **레이아웃은 ChallengeDetailScreen 과 1:1로 맞춘다.** 이 화면은 쿼리가
 * 도착하면 통째로 교체되는데, 구조가 다르면 그 순간 콘텐츠가 밀려 CLS 가
 * 난다(초판이 그랬다 — 모바일에서 제목이 히어로 안에 있다가 시트 안으로
 * 이동했다). 그래서 실화면과 같은 순서·같은 클래스를 쓴다:
 *
 *   히어로(hideTextOnMobile) → 모바일 컨텐츠 시트(-mt-5 rounded-t) → 탭 바
 *   → 소개 카드
 *
 * 좋아요 수·진행률처럼 인증이 필요한 값은 채울 수 없으므로 **같은 크기의
 * 자리만 예약**한다(값을 0으로 채우면 잠깐 틀린 수가 보인다).
 *
 * 'use client' 인 이유: 히어로·태그가 design-system 을 쓰는데 이 패키지는
 * RSC 에서 import 하면 빌드가 깨진다. 서버에서 렌더되므로 초기 HTML 에는
 * 그대로 실린다.
 */
export function ChallengeDetailPreview({
  challenge,
}: ChallengeDetailPreviewProps): React.ReactElement {
  const accent = getCategoryAccent(
    (challenge.category ?? undefined) as ChallengeCategory | undefined
  );
  const categoryLabel = getCategoryLabel(challenge.category);
  const typeLabel = formatChallengeTypeLabel(challenge.goalType);
  const description = challenge.description?.trim();
  // 실화면과 **같은 함수**로 만든다. 문구가 다르면 교체 순간 한 줄이 바뀐다.
  const metaLabel = buildChallengeHeroMeta({
    participationType: challenge.participationType,
    participantCnt: challenge.participantCnt,
    maxParticipantCnt: challenge.maxParticipantCnt,
    endDate: challenge.endDate,
  });

  return (
    // 하단 패딩까지 실화면과 맞춘다. 모바일 CTA 바가 붙는 만큼을 비워두지
    // 않으면 교체 순간 스크롤 높이가 튄다.
    <div
      className={cn(
        'allow-user-select min-h-screen w-full bg-white',
        'pb-mobile-action-bar lg:pb-12'
      )}
    >
      <div className="relative">
        <ChallengeDetailHero
          title={challenge.title}
          categoryLabel={categoryLabel}
          category={challenge.category}
          typeLabel={`${typeLabel} 챌린지`}
          metaLabel={metaLabel}
          imageUrl={challenge.thumbnailImage}
          accent={accent}
          gradient={buildHeroGradient(accent)}
          bleed
          hideTextOnMobile
        />
      </div>

      {/* 모바일 컨텐츠 헤더 — ChallengeDetailMobileHeader 와 같은 박스. */}
      <div
        className={cn(
          'relative z-10 -mt-5 rounded-t-[20px] bg-white px-5 pt-5 pb-1',
          'lg:hidden'
        )}
      >
        <div className="flex flex-wrap items-center gap-1.5">
          <Tag tone="brand" size="sm">
            {categoryLabel}
          </Tag>
          <Tag tone="gray" size="sm">
            {typeLabel}
          </Tag>
        </div>
        <Text
          as="h1"
          size="heading1"
          weight="extrabold"
          className="mt-2.5 block tracking-[-0.5px] break-keep text-gray-900"
        >
          {challenge.title}
        </Text>
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <Text
            size="caption1"
            weight="regular"
            className="min-w-0 flex-1 text-gray-500"
          >
            {metaLabel}
          </Text>
          {/* 좋아요 버튼 자리 — 수는 로그인 응답에 있어 아직 모른다. */}
          <Skeleton
            pulse={false}
            shape="pill"
            className="h-[26px] w-14 shrink-0"
          />
        </div>
        {/* 진행률 바 자리 — 실화면과 같은 높이로 예약. */}
        <div
          className={cn(
            'mt-3.5 flex items-center gap-2.5 rounded-[12px]',
            'border-main-300 bg-main-100 border px-3.5 py-2.5'
          )}
        >
          <Text
            size="caption1"
            weight="bold"
            className="shrink-0 text-gray-600"
          >
            진행률
          </Text>
          <div className="h-[7px] flex-1 overflow-hidden rounded-full bg-white" />
          <Skeleton pulse={false} shape="text" className="h-5 w-16 shrink-0" />
        </div>
      </div>

      <div
        className={cn(
          'relative z-10 flex w-full flex-col gap-3 px-5 pt-3',
          'sm:pt-6 md:px-6 lg:gap-4 lg:px-8 lg:pt-8'
        )}
      >
        <div
          className={cn(
            'grid grid-cols-1 gap-4',
            'lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-7'
          )}
        >
          <div className="flex min-w-0 flex-col">
            {/* 탭 바 자리 — 실화면과 같은 높이. */}
            <div className="flex gap-5 border-b border-gray-100 pb-2.5">
              {['소개', '일지', '참여자'].map((label) => (
                <span
                  key={label}
                  className="text-[15px] font-bold text-gray-400"
                >
                  {label}
                </span>
              ))}
            </div>

            <div className="mt-4 flex min-w-0 flex-col gap-3.5 lg:gap-4">
              <section
                className={cn(
                  'rounded-[14px] border border-gray-100 bg-gray-50',
                  'lg:border-gray-200 lg:bg-white',
                  'p-4 sm:p-5 lg:p-6'
                )}
              >
                <Text
                  as="h2"
                  size="body1"
                  weight="bold"
                  className="mb-3 block text-gray-900"
                >
                  챌린지 소개
                </Text>
                {description ? (
                  <Text
                    as="p"
                    size="body2"
                    className="break-keep whitespace-pre-wrap text-gray-700"
                  >
                    {description}
                  </Text>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Skeleton
                      pulse={false}
                      shape="text"
                      className="h-3.5 w-full"
                    />
                    <Skeleton
                      pulse={false}
                      shape="text"
                      className="h-3.5 w-[92%]"
                    />
                    <Skeleton
                      pulse={false}
                      shape="text"
                      className="h-3.5 w-[60%]"
                    />
                  </div>
                )}
              </section>
            </div>
          </div>

          {/* 우측 레일 자리 — 데스크톱에서만 존재한다(실화면과 동일). */}
          <aside
            className={cn(
              'hidden min-w-0 flex-col gap-3.5',
              'lg:sticky lg:top-6 lg:flex lg:self-start'
            )}
          >
            <div className="rounded-2xl border border-gray-100 bg-white p-[18px]">
              <Skeleton pulse={false} shape="text" className="h-3.5 w-16" />
              <Skeleton pulse={false} shape="text" className="mt-2 h-10 w-20" />
              <Skeleton
                pulse={false}
                shape="rounded"
                className="mt-2.5 h-2.5 w-full"
              />
              <Skeleton
                pulse={false}
                shape="rounded"
                className="mt-3.5 h-10 w-full"
              />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
