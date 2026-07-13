import { Text } from '@1d1s/design-system';
import { GuideMobileHeader } from '@feature/guide/components/GuideMobileHeader';
import { cn } from '@module/utils/cn';
import {
  ArrowDown,
  ArrowRight,
  Ban,
  Check,
  Flag,
  Flame,
  Gift,
  Heart,
  type LucideIcon,
  Medal,
  MessageSquare,
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

// ── 순위 기준 캐스케이드 (앞선 기준이 같을 때만 다음 기준으로) ──
const CRITERIA: Array<{
  icon: LucideIcon;
  accent: string;
  iconBg: string;
  kicker: string;
  note: string;
  title: string;
  desc: string;
}> = [
  {
    icon: Flame,
    accent: 'text-main-800',
    iconBg: 'bg-main-100 border-main-300',
    kicker: '1순위 기준',
    note: '연속 일지 작성일 기준',
    title: '최장 스트릭',
    desc: '연속으로 일지를 작성한 최장 일수. 하루라도 끊기면 스트릭이 다시 시작돼요.',
  },
  {
    icon: Check,
    accent: 'text-mint-900',
    iconBg: 'bg-mint-100 border-mint-400',
    kicker: '2순위 기준',
    note: '완료 처리된 목표 합계',
    title: '완료한 목표 수',
    desc: '스트릭이 같다면, 일지에서 완료 체크한 목표가 더 많은 사람이 앞섭니다.',
  },
  {
    icon: Heart,
    accent: 'text-red-500',
    iconBg: 'bg-red-50 border-red-300',
    kicker: '동점 처리 1',
    note: '동순위 1차 타이브레이크',
    title: '좋아요 개수',
    desc: '여기까지 모두 같은 동순위라면, 받은 좋아요 총합이 더 많은 사람이 앞섭니다.',
  },
  {
    icon: MessageSquare,
    accent: 'text-blue-600',
    iconBg: 'bg-blue-200 border-blue-300',
    kicker: '동점 처리 2',
    note: '도배 댓글 제외 후 산정',
    title: '댓글 개수',
    desc: '좋아요까지 같다면 댓글 수로 판단해요. 단, 도배로 판단된 댓글은 집계에서 빠집니다.',
  },
];

const REWARD_POINTS = [
  '상위 5명에게 지급',
  '참여자 수에 따라 5명보다 더 많이 지급될 수 있어요',
  '챌린지 종료 후 최종 순위를 기준으로 지급',
  '지급 방식·일정은 챌린지 상세 공지를 확인하세요',
];

// 네이버 포인트 브랜드 컬러 — DS 토큰에 없는 외부 브랜드 색
// ponytail: 인라인 상수 1개, 브랜드 색이라 토큰화 불필요
const NAVER_GREEN = '#03C75A';

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

// 순위 산정 미리보기 — 참여자 순위 목업(동점 tiebreak 시나리오 포함)
function LeaderboardMock(): React.ReactElement {
  const rows = [
    { r: 1, u: '러닝하는민지', streak: 30, goals: 30, likes: 210, tone: '#ffe0b2' },
    { r: 2, u: '새벽별', streak: 28, goals: 25, likes: 142, tone: '#c8f4e1' },
    { r: 2, u: '꾸준함이답', streak: 28, goals: 25, likes: 118, tone: '#deecfb' },
    { r: 4, u: '오늘도한걸음', streak: 24, goals: 22, likes: 96, tone: '#fff3e0' },
  ];
  const medal: Record<number, string> = { 1: '#FCD34D', 2: '#D5DAE1', 3: '#E2A56E' };
  return (
    <div
      className={cn(
        'w-[248px] shrink-0 rounded-[26px] border border-gray-200 bg-white',
        'p-2 shadow-[0_12px_30px_rgba(0,0,0,0.1)]'
      )}
    >
      <div className="overflow-hidden rounded-[19px] bg-gray-50 p-3">
        <div className="mb-2.5 flex items-center gap-1.5">
          <span
            className={cn(
              'bg-main-800 inline-flex items-center gap-1 rounded-full',
              'px-2 py-[3px] text-[9px] font-extrabold text-white'
            )}
          >
            <Trophy className="h-2.5 w-2.5" /> 공식
          </span>
          <Text size="caption2" weight="extrabold" className="text-gray-800">
            참여자 순위
          </Text>
        </div>
        <div className="flex flex-col gap-1.5">
          {rows.map((x, i) => (
            <div
              key={i}
              className={cn(
                'flex items-center gap-2 rounded-[12px] border bg-white',
                'px-2.5 py-2',
                x.r === 1 ? 'border-main-300' : 'border-gray-200'
              )}
            >
              <span
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center',
                  'rounded-full text-[10px] font-extrabold text-white'
                )}
                style={{ background: medal[x.r] ?? '#e5e7eb' }}
              >
                {x.r}
              </span>
              <span
                className="h-5 w-5 shrink-0 rounded-full"
                style={{ background: x.tone }}
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[10.5px] font-extrabold text-gray-900">
                  {x.u}
                </div>
                <div className="mt-0.5 flex gap-2 text-[8.5px] font-bold text-gray-500">
                  <span className="inline-flex items-center gap-0.5">
                    <Flame className="text-main-800 h-2.5 w-2.5" />
                    {x.streak}
                  </span>
                  <span className="inline-flex items-center gap-0.5">
                    <Check className="text-mint-900 h-2.5 w-2.5" />
                    {x.goals}
                  </span>
                  <span className="inline-flex items-center gap-0.5">
                    <Heart className="h-2.5 w-2.5 text-red-500" />
                    {x.likes}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div
          className={cn(
            'border-main-400 bg-main-100 mt-2.5 rounded-[9px] border',
            'border-dashed px-2.5 py-2 text-[8.5px] leading-relaxed',
            'break-keep text-gray-600'
          )}
        >
          <b className="text-main-800">2위 동점</b> — 스트릭·목표 수가 같아{' '}
          <b>좋아요(142{'>'}118)</b>로 순서가 갈렸어요.
        </div>
      </div>
    </div>
  );
}

function RankingSection(): React.ReactElement {
  return (
    <section className="pt-16">
      <div className="animate-pop-in text-center">
        <Text
          size="caption1"
          weight="extrabold"
          className="text-main-800 mb-2 block tracking-wide"
        >
          RANKING
        </Text>
        <Text
          as="h2"
          size="display1"
          weight="extrabold"
          className="mb-3 block tracking-tight text-gray-900"
        >
          순위는 이렇게 매겨져요
        </Text>
        <Text
          size="body1"
          weight="regular"
          className="mx-auto block max-w-[560px] leading-relaxed break-keep text-gray-600"
        >
          위 기준부터 차례로 비교합니다. 앞선 기준이 같을 때만 다음 기준으로
          내려가요.
        </Text>
      </div>

      <div
        className={cn(
          'mt-11 flex flex-col items-center gap-10',
          'lg:flex-row lg:items-start lg:justify-center'
        )}
      >
        {/* 캐스케이드 */}
        <div className="w-full max-w-[640px] min-w-0 lg:flex-1">
          {CRITERIA.map((c, i) => {
            const CritIcon = c.icon;
            return (
              <div key={c.title}>
                <div
                  className={cn(
                    'animate-pop-in rounded-4 flex gap-4 border border-gray-200',
                    'bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.04)]'
                  )}
                >
                  <span
                    className={cn(
                      'flex h-[46px] w-[46px] shrink-0 items-center',
                      'justify-center rounded-[13px] border',
                      c.iconBg
                    )}
                  >
                    <CritIcon className={cn('h-[22px] w-[22px]', c.accent)} />
                  </span>
                  <div className="flex-1">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <Text
                        size="caption2"
                        weight="extrabold"
                        className={cn('tracking-wide', c.accent)}
                      >
                        {c.kicker}
                      </Text>
                      <span
                        className={cn(
                          'rounded-full bg-gray-100 px-2 py-0.5',
                          'text-[10.5px] font-bold text-gray-400'
                        )}
                      >
                        {c.note}
                      </span>
                    </div>
                    <Text
                      size="heading2"
                      weight="extrabold"
                      className="mb-1.5 block tracking-tight text-gray-900"
                    >
                      {c.title}
                    </Text>
                    <Text
                      size="body2"
                      weight="regular"
                      className="block leading-relaxed break-keep text-gray-600"
                    >
                      {c.desc}
                    </Text>
                  </div>
                </div>
                {i < CRITERIA.length - 1 ? (
                  <div className="flex items-center justify-center gap-2 py-2 text-gray-400">
                    <Text size="caption1" weight="bold" className="text-gray-400">
                      같으면
                    </Text>
                    <ArrowDown className="h-4 w-4" strokeWidth={2.2} />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* 목업 폰 */}
        <div className="animate-pop-in shrink-0 lg:sticky lg:top-20">
          <LeaderboardMock />
        </div>
      </div>

      {/* 경쟁 순위(동점) 규칙 */}
      <div
        className={cn(
          'animate-pop-in rounded-4 mx-auto mt-10 flex max-w-[640px] gap-3.5',
          'bg-gray-900 p-5 text-white'
        )}
      >
        <span
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center',
            'rounded-[11px] bg-white/10'
          )}
        >
          <Medal className="h-5 w-5 text-[#ffd479]" strokeWidth={2} />
        </span>
        <div>
          <Text size="body1" weight="extrabold" className="mb-1.5 block text-white">
            동점자는 같은 등수예요
          </Text>
          <Text
            size="body2"
            weight="regular"
            className="block leading-relaxed break-keep text-white/80"
          >
            끝까지 완전히 동점이면 <b className="text-white">같은 등수</b>를
            부여하고, 그 인원만큼 다음 등수는 건너뜁니다. 예를 들어 2위가 두
            명이면 다음은{' '}
            <b className="text-[#ffd479] tabular-nums">1 · 2 · 2 · 4</b>위 순이
            돼요.
          </Text>
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

function RewardSection(): React.ReactElement {
  return (
    <section className="pt-16">
      <div className="animate-pop-in mb-9 text-center">
        <Text
          size="caption1"
          weight="extrabold"
          className="text-main-800 mb-2 block tracking-wide"
        >
          REWARD
        </Text>
        <Text
          as="h2"
          size="display1"
          weight="extrabold"
          className="block tracking-tight text-gray-900"
        >
          보상 안내
        </Text>
      </div>
      <div
        className={cn(
          'animate-pop-in rounded-4 flex flex-col items-center gap-7 border',
          'border-gray-200 bg-white p-7 sm:p-9',
          'shadow-[0_2px_10px_rgba(0,0,0,0.04)]',
          'lg:flex-row lg:items-center'
        )}
      >
        {/* 기프티콘 카드 목업 */}
        <div
          className={cn(
            'w-[240px] shrink-0 overflow-hidden rounded-[18px] border',
            'border-gray-200 bg-white shadow-[0_8px_22px_rgba(0,0,0,0.08)]'
          )}
        >
          <div
            className="px-5 pt-5 pb-4 text-white"
            style={{ backgroundColor: NAVER_GREEN }}
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[12px] font-bold opacity-90">GIFT</span>
              <Gift className="h-5 w-5" strokeWidth={2} />
            </div>
            <div className="text-[13px] font-medium opacity-90">네이버 포인트</div>
            <div className="mt-0.5 text-[30px] font-extrabold tracking-tight">
              10,000
              <span className="ml-1 text-[15px] font-bold">원</span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-5 py-3.5">
            <span
              className={cn(
                'flex h-[30px] w-[30px] items-center justify-center',
                'rounded-[8px] bg-gray-100'
              )}
            >
              <Trophy
                className="h-[15px] w-[15px]"
                strokeWidth={2}
                style={{ color: NAVER_GREEN }}
              />
            </span>
            <div>
              <div className="text-[11px] font-medium text-gray-400">
                공식 챌린지 보상
              </div>
              <div className="text-[12.5px] font-bold text-gray-800">
                기프티콘
              </div>
            </div>
          </div>
        </div>

        <div className="w-full min-w-0 lg:flex-1">
          <span
            className={cn(
              'mb-3.5 inline-block rounded-full px-3 py-1',
              'text-[12px] font-bold text-white'
            )}
            style={{ backgroundColor: NAVER_GREEN }}
          >
            1만원 상당
          </span>
          <Text
            as="h3"
            size="heading1"
            weight="extrabold"
            className="mb-3 block tracking-tight break-keep text-gray-900"
          >
            네이버 포인트 기프티콘
          </Text>
          <Text
            size="body1"
            weight="regular"
            className="mb-4.5 block leading-relaxed break-keep text-gray-600"
          >
            공식 챌린지 순위에 따라 1만원 상당의 네이버 포인트 기프티콘이
            지급됩니다.
          </Text>
          <ul className="flex flex-col gap-2.5">
            {REWARD_POINTS.map((t) => (
              <li key={t} className="flex items-start gap-2.5">
                <Check
                  className="mt-0.5 h-4 w-4 shrink-0"
                  strokeWidth={2.6}
                  style={{ color: NAVER_GREEN }}
                />
                <Text
                  size="body2"
                  weight="regular"
                  className="block break-keep text-gray-700"
                >
                  {t}
                </Text>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Text
        size="caption2"
        weight="regular"
        className="animate-pop-in mx-auto mt-4.5 block max-w-[640px] text-center leading-relaxed break-keep text-gray-400"
      >
        보상 종류·금액·수량 및 지급 조건은 챌린지별 공지에 따라 달라질 수 있으며,
        부정 참여가 확인되면 지급이 제한될 수 있습니다.
      </Text>
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
        <RankingSection />
        <SpamNotice />
        <RewardSection />
        <ClosingCta />
      </div>
    </div>
  );
}
