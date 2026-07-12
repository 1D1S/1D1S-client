import { cn } from '@module/utils/cn';
import {
  BookOpen,
  CalendarDays,
  Camera,
  Check,
  Dumbbell,
  Flag,
  PencilLine,
  Pointer,
  Search,
  Target,
  Users,
} from 'lucide-react';
import React from 'react';

import type { GuideMockKey } from '../consts/guideData';

/** 목업을 담는 미니 폰 프레임 (순수 프레젠테이션) */
function GuidePhone({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div
      className={cn(
        'w-[236px] shrink-0 rounded-[26px] border border-gray-200',
        'bg-white p-2 shadow-[0_12px_30px_rgba(0,0,0,0.1)]'
      )}
    >
      <div className="overflow-hidden rounded-[19px] bg-gray-50">
        {children}
      </div>
    </div>
  );
}

// 카테고리별 대표색 — 실제 카드의 Stripe placeholder 색상 팔레트와 동일.
// (src/app.constants/categories.tsx 의 CATEGORY_STRIPE_TONES 를 따름)
const CATEGORY_HEX: Record<string, string> = {
  EXERCISE: '#ef4444',
  BOOK: '#16a34a',
  STUDY: '#6366f1',
};

const CATEGORY_ICON: Record<string, typeof Dumbbell> = {
  EXERCISE: Dumbbell,
  BOOK: BookOpen,
  STUDY: PencilLine,
};

/** 미니 무드 얼굴 — 일지 카드의 mood SVG 를 축소해 흉내낸 정적 아이콘 */
function MoodFace({ tone }: { tone: string }): React.ReactElement {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="11" fill={tone} opacity="0.18" />
      <circle cx="9" cy="10" r="1.4" fill={tone} />
      <circle cx="15" cy="10" r="1.4" fill={tone} />
      <path
        d="M8.5 14.5c1 1.4 2.2 2 3.5 2s2.5-.6 3.5-2"
        fill="none"
        stroke={tone}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** 미니 댓글 말풍선 — 실제 DiaryCard 와 동일한 인라인 SVG */
function CommentBubble(): React.ReactElement {
  return (
    <svg
      width={11}
      height={11}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-gray-400"
      aria-hidden
    >
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  );
}

// 챌린지 카드 (세로형) — 보드의 ChallengeCard 를 축소.
interface MiniChallenge {
  title: string;
  cat: string;
  catCode: string;
  range: string;
  count: string;
  remaining: string;
  group: boolean;
  photo?: boolean;
  official?: boolean;
}

function MiniChallengeCard({ c }: { c: MiniChallenge }): React.ReactElement {
  const CatIcon = CATEGORY_ICON[c.catCode];
  const hex = CATEGORY_HEX[c.catCode];
  return (
    <div
      className={cn(
        'overflow-hidden rounded-[11px] border bg-white',
        c.official
          ? 'border-main-800 shadow-[0_4px_14px_rgba(255,89,0,0.16)]'
          : 'border-gray-200'
      )}
    >
      <div className="p-1.5 pb-0">
        <div
          className="relative aspect-[21/9] overflow-hidden rounded-[7px]"
          style={{ background: hex }}
        >
          <div
            className={cn(
              'absolute inset-0',
              'bg-[linear-gradient(135deg,rgba(255,255,255,0.16),transparent)]'
            )}
          />
          <div
            className={cn(
              'absolute inset-0 flex flex-col items-center justify-center',
              'gap-0.5 text-white'
            )}
          >
            <span
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded-full',
                'bg-white/20 ring-1 ring-white/30'
              )}
            >
              <CatIcon className="h-3 w-3" />
            </span>
            <span className="text-[7px] font-bold text-white/95">{c.cat}</span>
          </div>
          <div className="absolute top-1 right-1 flex items-center gap-0.5">
            {c.official ? (
              <span
                className={cn(
                  'rounded-full bg-white px-1.5 py-0.5 text-[6.5px]',
                  'text-main-800 font-extrabold shadow-sm'
                )}
              >
                공식
              </span>
            ) : null}
            {c.photo ? (
              <span
                className={cn(
                  'bg-main-800 inline-flex items-center gap-0.5 rounded-full',
                  'px-1 py-0.5 text-[6.5px] font-bold text-white shadow-sm'
                )}
              >
                <Camera className="h-2 w-2" />
                인증샷
              </span>
            ) : null}
            <span
              className={cn(
                'rounded-full px-1.5 py-0.5 text-[6.5px] font-bold shadow-sm',
                c.group ? 'bg-main-800 text-white' : 'bg-white text-gray-900'
              )}
            >
              {c.group ? '단체' : '개인'}
            </span>
          </div>
        </div>
      </div>
      <div className="px-2 pt-1.5 pb-2">
        <div className="truncate text-[10px] font-extrabold text-gray-900">
          {c.title}
        </div>
        <div className="mt-1 flex items-center gap-1 text-[8px] text-gray-500">
          <CalendarDays className="h-2.5 w-2.5 shrink-0" />
          <span className="truncate">{c.range}</span>
        </div>
        <div
          className={cn(
            'mt-0.5 flex items-center gap-1',
            'text-[8px] text-gray-500'
          )}
        >
          <Users className="h-2.5 w-2.5 shrink-0" />
          <span>
            <span className="font-semibold text-gray-700">{c.count}</span> 참여중
          </span>
        </div>
        <div
          className={cn(
            'mt-1.5 flex items-center justify-between border-t',
            'border-gray-100 pt-1.5'
          )}
        >
          <div className="flex -space-x-1">
            {['#ffdac7', '#ffbaba', '#ffdac7'].map((bg, i) => (
              <span
                key={i}
                className="h-3.5 w-3.5 rounded-full ring-1 ring-white"
                style={{ background: bg }}
              />
            ))}
          </div>
          <span className="text-main-800 text-[8px] font-bold">
            {c.remaining}
          </span>
        </div>
      </div>
    </div>
  );
}

function MockBrowse(): React.ReactElement {
  const cards: MiniChallenge[] = [
    {
      title: '아침 30분 러닝 크루',
      cat: '운동',
      catCode: 'EXERCISE',
      range: '2026.07.01 ~ 07.31 · 31일',
      count: '8/10명',
      remaining: '19일 남음',
      group: true,
      photo: true,
      official: true,
    },
    {
      title: '하루 한 권 책 읽기',
      cat: '독서',
      catCode: 'BOOK',
      range: '2026.07.05 ~ 08.04 · 31일',
      count: '4명',
      remaining: '23일 남음',
      group: false,
    },
  ];
  const chips = [
    { l: '전체', on: true },
    { l: '운동', on: false },
    { l: '독서', on: false },
  ];
  return (
    <div className="p-2.5">
      <div
        className={cn(
          'mb-2 flex items-center gap-1.5 rounded-full border',
          'border-gray-200 bg-white px-2.5 py-1.5'
        )}
      >
        <Search className="h-2.5 w-2.5 text-gray-400" />
        <span className="text-[9px] font-semibold text-gray-400">
          챌린지 검색
        </span>
      </div>
      <div className="mb-2 flex gap-1">
        {chips.map((chip) => (
          <span
            key={chip.l}
            className={cn(
              'rounded-full px-2 py-[3px] text-[8px] font-bold',
              chip.on ? 'bg-main-800 text-white' : 'bg-gray-100 text-gray-500'
            )}
          >
            {chip.l}
          </span>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {cards.map((c) => (
          <MiniChallengeCard key={c.title} c={c} />
        ))}
      </div>
    </div>
  );
}

function MockCreateField({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}): React.ReactElement {
  return (
    <div className="mb-[9px]">
      <div className="mb-1 text-[9px] font-bold text-gray-500">{label}</div>
      <div
        className={cn(
          'rounded-[9px] border bg-white px-2.5 py-2',
          'text-[10.5px] font-bold',
          accent
            ? 'border-main-800 text-main-800'
            : 'border-gray-200 text-gray-800'
        )}
      >
        {value}
      </div>
    </div>
  );
}

function MockCreate(): React.ReactElement {
  return (
    <div className="p-[13px]">
      <div className="mb-3 text-[11.5px] font-extrabold text-gray-900">
        챌린지 만들기
      </div>
      <MockCreateField label="챌린지 이름" value="아침 30분 러닝 크루" accent />
      <div className="mb-[9px]">
        <div className="mb-1 text-[9px] font-bold text-gray-500">참여 방식</div>
        <div className="flex gap-1">
          <span
            className={cn(
              'bg-main-800 flex-1 rounded-[8px] py-1.5 text-center',
              'text-[9.5px] font-extrabold text-white'
            )}
          >
            단체
          </span>
          <span
            className={cn(
              'flex-1 rounded-[8px] bg-gray-100 py-1.5 text-center',
              'text-[9.5px] font-bold text-gray-500'
            )}
          >
            개인
          </span>
        </div>
      </div>
      <div className="mb-[9px]">
        <div className="mb-1 text-[9px] font-bold text-gray-500">오늘의 목표</div>
        <div className="flex flex-wrap gap-1">
          {['5km 달리기', '스트레칭 10분'].map((g) => (
            <span
              key={g}
              className={cn(
                'bg-main-100 text-main-800 rounded-full px-2 py-1',
                'text-[9px] font-bold'
              )}
            >
              {g}
            </span>
          ))}
        </div>
      </div>
      <MockCreateField label="기간" value="2026.07.01 ~ 07.31" />
      <div
        className={cn(
          'mb-3 flex items-center justify-between rounded-[9px] border',
          'border-main-300 bg-main-100 px-2.5 py-2'
        )}
      >
        <span className="inline-flex items-center gap-1">
          <Camera className="text-main-800 h-3 w-3" />
          <span className="text-[10px] font-bold text-gray-700">
            인증샷 필수
          </span>
        </span>
        <span className="bg-main-800 relative h-[15px] w-[26px] rounded-full">
          <span
            className={cn(
              'absolute top-[2px] right-[2px] h-[11px] w-[11px]',
              'rounded-full bg-white'
            )}
          />
        </span>
      </div>
      <div
        className={cn(
          'bg-main-800 rounded-[10px] py-2.5 text-center',
          'text-[11px] font-extrabold text-white'
        )}
      >
        만들기
      </div>
    </div>
  );
}

function MockDiary(): React.ReactElement {
  const goals = [
    { t: '한강 5km 완주', done: true },
    { t: '스트레칭 10분', done: true },
    { t: '물 2L 마시기', done: false },
  ];
  return (
    <div className="p-[11px]">
      <div className="rounded-[12px] border border-gray-300 bg-white p-2.5">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              'border-main-200 bg-main-100 text-main-800 inline-flex',
              'min-w-0 items-center gap-0.5 rounded-full border px-1.5',
              'py-0.5 text-[8.5px] font-bold'
            )}
          >
            <Flag className="h-2 w-2 shrink-0" />
            <span className="truncate">아침 러닝</span>
          </span>
          <span className="flex shrink-0 items-center gap-1">
            <span className="text-[8.5px] font-medium text-gray-400">
              7월 6일
            </span>
            <MoodFace tone="#ff6b4a" />
          </span>
        </div>
        <div
          className={cn(
            'mt-1.5 text-[11px] font-extrabold tracking-tight',
            'text-gray-900'
          )}
        >
          오늘도 한강 5km 완주!
        </div>
        <p
          className={cn(
            'mt-1 line-clamp-2 text-[9px] leading-relaxed',
            'text-gray-600'
          )}
        >
          날이 선선해서 페이스가 잘 나왔다. 내일도 이 시간에 나와야지.
        </p>
        <div
          className="mt-2 aspect-video overflow-hidden rounded-[9px]"
          style={{ background: '#ef4444' }}
        >
          <div
            className={cn(
              'h-full w-full',
              'bg-[linear-gradient(135deg,rgba(255,255,255,0.16),transparent)]'
            )}
          />
        </div>
        <div className="mt-2 flex items-start justify-between gap-2">
          <ul className="flex min-w-0 flex-1 flex-col gap-1">
            {goals.map((g) => (
              <li key={g.t} className="flex items-center gap-1.5">
                <span
                  className={cn(
                    'flex h-3.5 w-3.5 shrink-0 items-center justify-center',
                    'rounded-full',
                    g.done
                      ? 'bg-main-700'
                      : 'border-[1.5px] border-gray-300'
                  )}
                >
                  {g.done ? (
                    <Check className="h-2 w-2 text-white" strokeWidth={3} />
                  ) : null}
                </span>
                <span
                  className={cn(
                    'truncate text-[9px] font-bold',
                    g.done ? 'text-gray-800' : 'text-gray-400'
                  )}
                >
                  {g.t}
                </span>
              </li>
            ))}
          </ul>
          <span className="text-main-700 shrink-0 text-[9px] font-extrabold">
            달성 67%
          </span>
        </div>
        <div
          className={cn(
            'mt-2 flex items-center justify-between gap-2 border-t',
            'border-gray-100 pt-2'
          )}
        >
          <span className="inline-flex min-w-0 items-center gap-1">
            <span className="h-4 w-4 shrink-0 rounded-full bg-gray-100" />
            <span className="truncate text-[8.5px] font-medium text-gray-500">
              새벽러너
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-1.5">
            <span
              className={cn(
                'inline-flex items-center gap-0.5 text-[8.5px]',
                'font-bold text-red-500'
              )}
            >
              <svg
                width={11}
                height={11}
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden
              >
                {/* eslint-disable-next-line max-len -- SVG 하트 path 는 분리 불가 */}
                <path d="M12 21s-7.5-4.6-10-9.3C.4 8.4 2 5 5.4 5c2 0 3.3 1.1 4.1 2.3.8-1.2 2.1-2.3 4.1-2.3 3.4 0 5 3.4 3.4 6.7C19.5 16.4 12 21 12 21z" />
              </svg>
              24
            </span>
            <span
              className={cn(
                'inline-flex items-center gap-0.5 text-[8.5px]',
                'font-bold text-gray-500'
              )}
            >
              <CommentBubble />3
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

// 1/2/3등 메달 색 — ChallengeLeaderboardCard 의 MEDAL_TONES 와 동일.
const MEDAL: Record<number, string> = {
  1: '#FCD34D',
  2: '#D5DAE1',
  3: '#E2A56E',
};

function MockTogether(): React.ReactElement {
  const rows = [
    { r: 1, n: '새벽러너', s: '12일 연속 · 목표 3개', host: true },
    { r: 2, n: '러닝왕', s: '10일 연속 · 목표 2개', poke: true },
    { r: 3, n: '달리는곰', s: '8일 연속 · 목표 2개', poke: true },
  ];
  const tabs = [
    { l: '소개', on: false },
    { l: '통계', on: false },
    { l: '일지', on: false },
    { l: '참여자', on: true },
  ];
  return (
    <div>
      <div className="relative aspect-[21/9]" style={{ background: '#ef4444' }}>
        <div
          className={cn(
            'absolute inset-0',
            'bg-[linear-gradient(to_top,rgba(0,0,0,0.5),transparent)]'
          )}
        />
        <div className="absolute inset-0 flex flex-col justify-end gap-1 p-2.5">
          <div className="flex items-center gap-1">
            {['운동', '공식'].map((p) => (
              <span
                key={p}
                className={cn(
                  'rounded-full bg-white/90 px-1.5 py-0.5',
                  'text-[7px] font-extrabold text-[#ef4444]'
                )}
              >
                {p}
              </span>
            ))}
          </div>
          <span
            className={cn(
              'text-[11px] font-extrabold tracking-tight',
              'text-white drop-shadow-sm'
            )}
          >
            아침 30분 러닝 크루
          </span>
        </div>
      </div>
      <div className="flex justify-between border-b border-gray-100 px-3">
        {tabs.map((t) => (
          <span
            key={t.l}
            className={cn(
              'border-b-2 px-1 py-1.5 text-[9px] font-bold',
              t.on
                ? 'border-main-800 text-main-800'
                : 'border-transparent text-gray-400'
            )}
          >
            {t.l}
          </span>
        ))}
      </div>
      <div className="p-3">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-[10px] font-extrabold text-gray-900">
            참여자
          </span>
          <span className="text-[8px] font-medium text-gray-500">10명</span>
        </div>
        <div className="flex flex-col gap-1.5">
          {rows.map((m) => (
            <div key={m.r} className="flex items-center gap-1.5">
              <span
                className={cn(
                  'flex h-4 w-4 shrink-0 items-center justify-center',
                  'rounded-full text-[8px] font-extrabold text-white'
                )}
                style={{ background: MEDAL[m.r] }}
              >
                {m.r}
              </span>
              <span className="h-5 w-5 shrink-0 rounded-full bg-[#fff0e6]" />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="flex items-center gap-1">
                  <span
                    className={cn(
                      'truncate text-[9.5px] font-bold',
                      'text-gray-800'
                    )}
                  >
                    {m.n}
                  </span>
                  {m.host ? (
                    <span
                      className={cn(
                        'bg-main-200 text-main-800 shrink-0 rounded-full',
                        'px-1 py-[1px] text-[6.5px] font-extrabold'
                      )}
                    >
                      HOST
                    </span>
                  ) : null}
                </span>
                <span className="truncate text-[7.5px] text-gray-400">
                  {m.s}
                </span>
              </div>
              {m.poke ? (
                <span
                  className={cn(
                    'bg-main-100 text-main-800 inline-flex shrink-0',
                    'items-center gap-0.5 rounded-full px-1.5 py-0.5',
                    'text-[7.5px] font-bold'
                  )}
                >
                  <Pointer className="h-2 w-2" />콕 찌르기
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MiniKpi({
  label,
  value,
  unit,
  Icon,
  chip,
  fg,
}: {
  label: string;
  value: string;
  unit: string;
  Icon: typeof PencilLine;
  chip: string;
  fg: string;
}): React.ReactElement {
  return (
    <div className="rounded-[10px] border border-gray-200 bg-white p-2">
      <div className="mb-1 flex items-center gap-1">
        <span
          className={cn(
            'flex h-4 w-4 items-center justify-center rounded-[6px]',
            chip
          )}
        >
          <Icon className={cn('h-2.5 w-2.5', fg)} />
        </span>
        <span className="text-[8px] font-bold text-gray-500">{label}</span>
      </div>
      <div className="text-[16px] font-extrabold tracking-tight text-gray-900">
        {value}
        <span className="ml-0.5 text-[9px] font-bold text-gray-400">
          {unit}
        </span>
      </div>
    </div>
  );
}

function MockStats(): React.ReactElement {
  const bars = [1, 2, 0, 3, 2, 4, 3];
  const days = ['월', '화', '수', '목', '금', '토', '일'];
  const max = Math.max(...bars);
  const peak = bars.indexOf(max);
  return (
    <div className="p-[13px]">
      <div className="mb-2 grid grid-cols-2 gap-1.5">
        <MiniKpi
          label="작성한 일지"
          value="24"
          unit="개"
          Icon={PencilLine}
          chip="bg-main-200"
          fg="text-main-700"
        />
        <MiniKpi
          label="목표 달성률"
          value="68"
          unit="%"
          Icon={Target}
          chip="bg-mint-100"
          fg="text-mint-900"
        />
      </div>
      <div className="rounded-[11px] border border-gray-200 bg-white p-[11px]">
        <div className="mb-2 text-[9.5px] font-extrabold text-gray-700">
          작성 추이
        </div>
        <div className="grid grid-cols-7 items-end gap-1">
          {bars.map((c, i) => (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <span
                className={cn(
                  'text-[7px] font-extrabold tabular-nums',
                  i === peak ? 'text-main-800' : 'text-gray-400'
                )}
              >
                {c}
              </span>
              <div className="flex h-[46px] w-full items-end">
                <div
                  className={cn(
                    'w-full rounded-[5px]',
                    c === 0
                      ? 'bg-gray-100'
                      : i === peak
                        ? 'bg-main-800'
                        : 'bg-main-300'
                  )}
                  style={{
                    height: `${Math.max((c / max) * 100, c > 0 ? 14 : 6)}%`,
                  }}
                />
              </div>
              <span className="text-[7px] font-medium text-gray-400">
                {days[i]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const MOCKS: Record<GuideMockKey, () => React.ReactElement> = {
  browse: MockBrowse,
  create: MockCreate,
  diary: MockDiary,
  together: MockTogether,
  stats: MockStats,
};

export function GuidePhoneMock({
  mock,
}: {
  mock: GuideMockKey;
}): React.ReactElement {
  const Mock = MOCKS[mock];
  return (
    <GuidePhone>
      <Mock />
    </GuidePhone>
  );
}
