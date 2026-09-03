import { Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import {
  ArrowDown,
  Check,
  Flame,
  Heart,
  type LucideIcon,
  Medal,
  MessageSquare,
  Trophy,
} from 'lucide-react';
import React from 'react';

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

// 공식 챌린지 가이드 "순위 산정" 섹션(캐스케이드 + 목업 + 동점 규칙).
// OfficialGuideScreen 에서 분리한 프레젠테이션 컴포넌트(마크업/클래스 불변).
export function OfficialRankingSection(): React.ReactElement {
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
