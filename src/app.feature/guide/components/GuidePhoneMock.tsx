import { cn } from '@module/utils/cn';
import { Camera, Heart, MessageCircle, Search } from 'lucide-react';
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

/** 미니 진행률 링 */
function MiniRing({
  pct,
  size = 22,
  stroke = 3,
}: {
  pct: number;
  size?: number;
  stroke?: number;
}): React.ReactElement {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <span
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          className="stroke-gray-100"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          className="stroke-main-800"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct / 100)}
        />
      </svg>
      <span className="text-main-800 absolute text-[8px] font-extrabold">
        {pct}
      </span>
    </span>
  );
}

const TONE: Record<string, string> = {
  orange: 'bg-main-300',
  mint: 'bg-mint-200',
  blue: 'bg-blue-200',
};

function MockBrowse(): React.ReactElement {
  const items = [
    { t: '아침 30분 러닝 크루', c: '운동', tone: 'orange', s: '8/10명', on: true },
    { t: '하루 한 권 책 읽기', c: '독서', tone: 'mint', s: '12/20명' },
    { t: '물 2L 마시기', c: '건강', tone: 'blue', s: '1/1명' },
  ];
  return (
    <div className="p-3">
      <div
        className={cn(
          'mb-3 flex items-center gap-1.5 rounded-full border',
          'border-gray-200 bg-white px-3 py-[7px]'
        )}
      >
        <Search className="h-3 w-3 text-gray-400" />
        <span className="text-[10.5px] font-semibold text-gray-400">
          챌린지 검색
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {items.map((it) => (
          <div
            key={it.t}
            className={cn(
              'flex gap-2 rounded-[12px] border bg-white p-2',
              it.on
                ? 'border-main-800 shadow-[0_3px_12px_rgba(255,89,0,0.14)]'
                : 'border-gray-200'
            )}
          >
            <span
              className={cn(
                'h-[42px] w-[42px] shrink-0 rounded-[9px]',
                TONE[it.tone]
              )}
            />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[11px] font-extrabold text-gray-900">
                {it.t}
              </div>
              <div className="mt-[3px] text-[9px] font-semibold text-gray-400">
                {it.c} · {it.s}
              </div>
            </div>
            <span
              className={cn(
                'self-center rounded-full px-2.5 py-[5px]',
                'text-[9.5px] font-extrabold whitespace-nowrap',
                it.on
                  ? 'bg-main-800 text-white'
                  : 'bg-gray-100 text-gray-500'
              )}
            >
              {it.on ? '참여' : '보기'}
            </span>
          </div>
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
        새 챌린지 만들기
      </div>
      <MockCreateField label="챌린지 이름" value="아침 30분 러닝 크루" accent />
      <MockCreateField label="기간" value="2026.07.01 ~ 07.31" />
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
      <div
        className={cn(
          'mb-3 flex items-center justify-between rounded-[9px] border',
          'border-main-300 bg-main-100 px-2.5 py-2'
        )}
      >
        <span className="text-[10px] font-bold text-gray-700">
          사진 인증 필수
        </span>
        <span className="bg-main-800 relative h-[15px] w-[26px] rounded-full">
          <span className="absolute top-[2px] right-[2px] h-[11px] w-[11px] rounded-full bg-white" />
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
  return (
    <div className="p-[13px]">
      <div className="mb-3 text-[11.5px] font-extrabold text-gray-900">
        오늘의 일지
      </div>
      <div className="bg-main-300 relative mb-2.5 h-[78px] overflow-hidden rounded-[11px]">
        <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1">
          <Camera className="text-main-800 h-3 w-3" />
          <span className="text-main-800 text-[9px] font-extrabold">
            사진 인증
          </span>
        </span>
        <span
          className={cn(
            'absolute right-[7px] bottom-[7px] inline-flex items-center',
            'gap-1.5 rounded-full bg-white/95 py-[3px] pr-2 pl-1'
          )}
        >
          <MiniRing pct={100} />
          <span className="text-main-800 text-[9px] font-extrabold">
            달성 100%
          </span>
        </span>
      </div>
      <div
        className={cn(
          'mb-2 rounded-[10px] border border-gray-200 bg-white',
          'px-2.5 py-[9px] text-[10.5px] font-bold text-gray-800'
        )}
      >
        오늘도 한강 5km 완주!
      </div>
      <div
        className={cn(
          'mb-3 rounded-[10px] border border-gray-200 bg-white px-2.5',
          'py-[9px] text-[9.5px] leading-relaxed text-gray-500'
        )}
      >
        날이 선선해서 페이스가 잘 나왔다. 내일도 이 시간에!
      </div>
      <div
        className={cn(
          'bg-main-800 rounded-[10px] py-2.5 text-center',
          'text-[11px] font-extrabold text-white'
        )}
      >
        기록 저장
      </div>
    </div>
  );
}

function MockTogether(): React.ReactElement {
  const rows = [
    { r: 1, n: '새벽러너', s: 10, tone: 'orange', medal: 'bg-[#FCD34D]' },
    { r: 2, n: '러닝왕', s: 8, tone: 'blue', medal: 'bg-gray-300' },
    { r: 3, n: '달리는곰', s: 7, tone: 'mint', medal: 'bg-[#E2A56E]' },
  ];
  return (
    <div className="p-[13px]">
      <div className="mb-3 text-[11.5px] font-extrabold text-gray-900">
        이번 주 리더보드
      </div>
      <div className="mb-3 flex flex-col gap-[7px]">
        {rows.map((m) => (
          <div
            key={m.r}
            className={cn(
              'flex items-center gap-2 rounded-[10px] border',
              'border-gray-100 bg-white px-2.5 py-[7px]'
            )}
          >
            <span
              className={cn(
                'flex h-[18px] w-[18px] items-center justify-center',
                'rounded-full text-[9px] font-extrabold text-white',
                m.medal
              )}
            >
              {m.r}
            </span>
            <span
              className={cn(
                'h-6 w-6 shrink-0 rounded-full',
                TONE[m.tone]
              )}
            />
            <span className="flex-1 text-[10.5px] font-extrabold text-gray-900">
              {m.n}
            </span>
            <span className="text-[9px] font-bold text-gray-400">
              {m.s}일 연속
            </span>
          </div>
        ))}
      </div>
      <div
        className={cn(
          'flex items-center gap-2 rounded-[10px] border',
          'border-main-300 bg-main-100 px-2.5 py-[9px]'
        )}
      >
        <span className="text-main-800 inline-flex items-center gap-1 text-[10px] font-extrabold">
          <Heart className="h-3 w-3" />
          24
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-gray-500">
          <MessageCircle className="h-3 w-3 text-gray-400" />3
        </span>
        <span
          className={cn(
            'border-main-800 ml-auto rounded-full border bg-white',
            'text-main-800 px-2 py-1 text-[9px] font-extrabold'
          )}
        >
          콕 찌르기
        </span>
      </div>
    </div>
  );
}

function MockStats(): React.ReactElement {
  const bars = [1, 2, 0, 3, 2, 4, 1, 2, 3, 5];
  const max = Math.max(...bars);
  const peak = bars.indexOf(max);
  return (
    <div className="p-[13px]">
      <div className="mb-3 grid grid-cols-2 gap-[7px]">
        {[
          ['참여율', '72%'],
          ['목표 완료', '68%'],
        ].map(([l, v]) => (
          <div
            key={l}
            className="rounded-[10px] border border-gray-200 bg-white px-2.5 py-[9px]"
          >
            <div className="text-[8.5px] font-bold text-gray-500">{l}</div>
            <div className="mt-0.5 text-[18px] font-extrabold tracking-tight text-gray-900">
              {v}
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-[11px] border border-gray-200 bg-white p-[11px]">
        <div className="mb-2 text-[9.5px] font-extrabold text-gray-700">
          날짜별 일지 추이
        </div>
        <div className="grid h-[62px] grid-cols-10 items-end gap-1">
          {bars.map((c, i) => (
            <div key={i} className="flex h-full items-end">
              <div
                className={cn(
                  'w-full rounded-[4px]',
                  c === 0
                    ? 'bg-gray-100'
                    : i === peak
                      ? 'bg-main-800'
                      : 'bg-main-300'
                )}
                style={{
                  height: `${Math.max((c / max) * 100, c > 0 ? 12 : 5)}%`,
                }}
              />
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
