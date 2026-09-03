import { Text } from '@1d1s/design-system';
import { GuideMobileHeader } from '@feature/guide/components/GuideMobileHeader';
import { OfficialRankingSection } from '@feature/guide/components/OfficialRankingSection';
import { OfficialRewardSection } from '@feature/guide/components/OfficialRewardSection';
import { cn } from '@module/utils/cn';
import {
  ArrowRight,
  Ban,
  Flag,
  Gift,
  type LucideIcon,
  Shield,
  Trophy,
} from 'lucide-react';
import Link from 'next/link';
import React from 'react';

// ── 3줄 요약 ──
const SUMMARY: Array<{ icon: LucideIcon; title: string; desc: string }> = [
  {
    icon: Flag,
    title: '진행은 그대로',
    desc: '참여·일지 기록·좋아요·댓글까지 일반 챌린지와 100% 동일해요.',
  },
  {
    icon: Shield,
    title: '운영자가 관리',
    desc: '1D1S 운영자가 직접 개설하고 운영·검수하는 챌린지예요.',
  },
  {
    icon: Gift,
    title: '보상이 있어요',
    desc: '순위에 따라 기프티콘 보상이 지급됩니다.',
  },
];

// ── 일반 vs 공식 비교 ──
const DIFF: Array<{
  icon: LucideIcon;
  label: string;
  normal: string;
  official: string;
}> = [
  {
    icon: Shield,
    label: '운영 주체',
    normal: '누구나 개설',
    official: '1D1S 운영자가 개설·관리',
  },
  {
    icon: Trophy,
    label: '순위 산정',
    normal: '없음 / 참고용',
    official: '공식 순위 규칙으로 정밀 산정',
  },
  {
    icon: Gift,
    label: '보상',
    normal: '없음',
    official: '순위에 따른 기프티콘',
  },
];



function SummaryCards(): React.ReactElement {
  return (
    <section className="animate-pop-in">
      <div className="grid gap-3.5 sm:grid-cols-3">
        {SUMMARY.map((c) => {
          const CardIcon = c.icon;
          return (
            <div
              key={c.title}
              className={cn(
                'rounded-2 border border-gray-200 bg-white p-5',
                'shadow-[0_2px_10px_rgba(0,0,0,0.04)]'
              )}
            >
              <span
                className={cn(
                  'mb-3 flex h-9 w-9 items-center justify-center',
                  'bg-main-100 rounded-[11px]'
                )}
              >
                <CardIcon className="text-main-800 h-[19px] w-[19px]" />
              </span>
              <Text
                size="body1"
                weight="extrabold"
                className="mb-1 block text-gray-900"
              >
                {c.title}
              </Text>
              <Text
                size="caption2"
                weight="regular"
                className="block leading-relaxed break-keep text-gray-500"
              >
                {c.desc}
              </Text>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function DiffCard(): React.ReactElement {
  return (
    <section className="animate-pop-in pt-14">
      <div
        className={cn(
          'rounded-4 border border-gray-200 bg-white p-7 sm:p-8',
          'shadow-[0_2px_10px_rgba(0,0,0,0.04)]'
        )}
      >
        <Text
          as="h2"
          size="heading1"
          weight="extrabold"
          className="mb-1.5 block tracking-tight text-gray-900"
        >
          일반 챌린지와 무엇이 다른가요?
        </Text>
        <Text
          size="body2"
          weight="regular"
          className="mb-6 block break-keep text-gray-500"
        >
          도전하는 방식은 똑같습니다. 딱 세 가지만 다릅니다.
        </Text>
        <div className="grid gap-4 sm:grid-cols-3">
          {DIFF.map((d) => {
            const DiffIcon = d.icon;
            return (
              <div
                key={d.label}
                className={cn(
                  'rounded-3 border border-gray-100 bg-gray-50 p-4.5'
                )}
              >
                <div className="mb-3 flex items-center gap-2">
                  <DiffIcon className="text-main-800 h-[17px] w-[17px]" />
                  <Text size="caption1" weight="extrabold" className="text-gray-900">
                    {d.label}
                  </Text>
                </div>
                <Text
                  size="caption2"
                  weight="regular"
                  className="mb-1.5 block break-keep text-gray-400"
                >
                  <b className="font-bold">일반</b> · {d.normal}
                </Text>
                <Text
                  size="caption2"
                  weight="bold"
                  className="block break-keep text-gray-800"
                >
                  <span className="text-main-800">공식</span> · {d.official}
                </Text>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SpamNotice(): React.ReactElement {
  return (
    <section
      className={cn(
        'animate-pop-in -mx-5 mt-16 border-y border-gray-200 bg-white',
        'px-5 py-14 lg:-mx-6 lg:px-6'
      )}
    >
      <div className="flex flex-wrap items-center gap-5">
        <span
          className={cn(
            'flex h-14 w-14 shrink-0 items-center justify-center',
            'rounded-[16px] border border-red-300 bg-red-50'
          )}
        >
          <Ban className="h-7 w-7 text-red-500" strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1 basis-[340px]">
          <Text
            as="h2"
            size="heading1"
            weight="extrabold"
            className="mb-2 block tracking-tight text-gray-900"
          >
            댓글 도배는 집계에서 빠져요
          </Text>
          <Text
            size="body2"
            weight="regular"
            className="block leading-relaxed break-keep text-gray-600"
          >
            댓글 개수로 순위를 가릴 때, <b>도배로 판단된 댓글</b>은 개수에서
            제거한 뒤 산정합니다. 짧은 시간에 같은/의미 없는 댓글을 반복적으로
            남기는 등 도배로 보이는 흔적이 확인되면 해당 댓글들은 카운트되지
            않아요. 순위는 도배가 아닌 진짜 소통을 기준으로 매겨집니다.
          </Text>
        </div>
      </div>
    </section>
  );
}

function ClosingCta(): React.ReactElement {
  return (
    <section className="animate-pop-in pt-16 pb-24 text-center">
      <div
        className={cn(
          'rounded-4 px-8 py-14 text-white',
          'shadow-[0_20px_48px_rgba(255,89,0,0.24)]',
          'bg-[linear-gradient(135deg,var(--main-600)_0%,var(--main-800)_100%)]'
        )}
      >
        <Text
          as="h2"
          size="display1"
          weight="extrabold"
          className="mb-3.5 block tracking-tight break-keep text-white"
        >
          공식 챌린지에
          <br />
          도전해볼까요?
        </Text>
        <Text
          as="p"
          size="body2"
          weight="regular"
          className="mx-auto mb-7 block max-w-[440px] leading-relaxed break-keep text-white/90"
        >
          평소처럼 매일 일지를 남기며 꾸준히 도전하세요. 상위 순위에는 기프티콘
          보상이 기다리고 있어요.
        </Text>
        <Link
          href="/challenge"
          className={cn(
            'inline-flex items-center gap-2 rounded-full bg-white',
            'text-main-800 px-7 py-3.5 text-[15.5px] font-extrabold',
            'shadow-[0_6px_18px_rgba(0,0,0,0.12)] transition hover:brightness-95'
          )}
        >
          공식 챌린지 보러가기
          <ArrowRight className="h-[17px] w-[17px]" strokeWidth={2.4} />
        </Link>
      </div>
      <Text size="caption2" weight="regular" className="mt-10 block text-gray-400">
        1 Day 1 Streak — 매일의 기록이 만드는 변화
      </Text>
    </section>
  );
}

export default function OfficialGuideScreen(): React.ReactElement {
  return (
    <div className="min-h-screen w-full">
      <GuideMobileHeader title="공식 챌린지 가이드" />

      <div className="mx-auto w-full max-w-[960px] px-5 lg:px-6">
        {/* 히어로 */}
        <header
          className={cn(
            'animate-pop-in rounded-3 lg:rounded-4 mb-4 px-6 pt-14 pb-16',
            'text-center lg:px-10 lg:pt-20 lg:pb-20',
            'bg-[linear-gradient(180deg,var(--main-100),var(--gray-50))]'
          )}
        >
          <span
            className={cn(
              'bg-main-800 mb-5 inline-flex items-center gap-1.5 rounded-full',
              'px-3.5 py-1.5 text-[12.5px] font-extrabold tracking-wide text-white'
            )}
          >
            <Trophy className="h-3.5 w-3.5" strokeWidth={2.2} />
            OFFICIAL CHALLENGE
          </span>
          <Text
            as="h1"
            size="display1"
            weight="extrabold"
            className="mx-auto mb-4 block tracking-tight break-keep text-gray-900"
          >
            똑같이 도전하고,
            <br />
            <span className="text-main-800">보상</span>까지 받는 챌린지
          </Text>
          <Text
            as="p"
            size="body1"
            weight="regular"
            className="mx-auto block max-w-[540px] leading-relaxed break-keep text-gray-600"
          >
            공식 챌린지는 일반 챌린지와 참여 방식이 똑같아요. 다만{' '}
            <b>1D1S 운영자가 직접 관리</b>하고, 순위에 따라 <b>보상</b>이
            주어집니다.
          </Text>
        </header>

        <SummaryCards />
        <DiffCard />
        <OfficialRankingSection />
        <SpamNotice />
        <OfficialRewardSection />
        <ClosingCta />
      </div>
    </div>
  );
}
