'use client';

import {
  Card,
  CircleAvatar,
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Text,
} from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import { ListChecks, Pointer } from 'lucide-react';
import React, { useState } from 'react';

interface LeaderboardEntryGoal {
  challengeGoalId: number;
  content: string;
}

interface LeaderboardEntry {
  participantId: number;
  memberId: number;
  nickname: string;
  profileImg?: string | null;
  isHost: boolean;
  goals?: LeaderboardEntryGoal[];
  // 등수 — 시작 전/순위 미산정이면 null. 양수일 때만 배지로 노출한다.
  rank?: number | null;
  streak?: number;
  completedGoalCount?: number;
}

interface ChallengeLeaderboardCardProps {
  entries: LeaderboardEntry[];
  onMemberClick?(memberId: number): void;
  maxRows?: number;
  // 전체 참여자 수 — "전체 보기" 노출 여부 판단(상세는 상위 5명만 내려온다).
  totalCount?: number;
  // 전체 참여자 목록 화면으로 이동. 지정 시 "전체 보기"가 모달 대신 이동한다.
  onShowAll?(): void;
  // 찌르기: 내가 참여 중 + 진행 중 + 오늘 일지 작성 완료일 때만 true
  canPoke?: boolean;
  // 내 행에는 찌르기 버튼을 노출하지 않기 위한 현재 로그인 사용자 식별값.
  // memberId 해석 실패 시 닉네임(유일값)으로 폴백 판별한다.
  currentMemberId?: number | null;
  currentNickname?: string | null;
  onPoke?(memberId: number): void;
  // 찌르기 요청 진행 중인 챌린지원 ID (버튼 비활성/스피너용)
  pokingMemberId?: number | null;
  // 이번 세션에서 이미 찌른 챌린지원 ID 목록
  pokedMemberIds?: number[];
}

interface MemberRowProps {
  entry: LeaderboardEntry;
  onSelect(): void;
  onGoals(): void;
}

// 1/2/3등 메달 색상 (금 / 은 / 동).
interface MedalTone {
  disc: string;
  ribbon: string;
  edge: string;
}

const MEDAL_TONES: Record<number, MedalTone> = {
  1: { disc: '#FCD34D', ribbon: '#F59E0B', edge: '#D9930A' },
  2: { disc: '#D5DAE1', ribbon: '#9AA4B2', edge: '#828C9B' },
  3: { disc: '#E2A56E', ribbon: '#C07A3E', edge: '#A5682F' },
};

// 리본 + 원반 + 등수 숫자로 구성한 메달 아이콘.
function MedalIcon({ rank }: { rank: number }): React.ReactElement {
  const tone = MEDAL_TONES[rank];
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-full w-full">
      <path d="M8.5 2 L11.5 2 L10.5 10 L7 9 Z" fill={tone.ribbon} />
      <path d="M15.5 2 L12.5 2 L13.5 10 L17 9 Z" fill={tone.ribbon} />
      <circle
        cx="12"
        cy="15"
        r="6.5"
        fill={tone.disc}
        stroke={tone.edge}
        strokeWidth="1"
      />
      <text
        x="12"
        y="15.5"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="8"
        fontWeight="800"
        fill="#ffffff"
      >
        {rank}
      </text>
    </svg>
  );
}

// 인라인 리스트와 "전체 보기" 모달이 공유하는 참여자 행.
// 아바타 + 닉네임 + HOST/참여중 배지 + 목표 버튼.
function MemberRow({
  entry,
  onSelect,
  onGoals,
}: MemberRowProps): React.ReactElement {
  const hasGoals = (entry.goals?.length ?? 0) > 0;

  const hasRank = typeof entry.rank === 'number' && entry.rank > 0;

  // 상위 3등은 메달 아이콘, 그 외에는 등수 숫자로 표시한다.
  const isMedal = hasRank && (entry.rank as number) <= 3;

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          'flex min-w-0 flex-1 cursor-pointer items-center gap-2.5',
          'rounded-md px-2 py-2.5 text-left transition-colors',
          'hover:bg-gray-50'
        )}
      >
        {hasRank ? (
          isMedal ? (
            <span className="h-5 w-5 shrink-0">
              <MedalIcon rank={entry.rank as number} />
            </span>
          ) : (
            <span
              className={cn(
                'flex h-5 w-5 shrink-0 items-center justify-center',
                'text-[12px] font-extrabold text-gray-400 tabular-nums'
              )}
            >
              {entry.rank}
            </span>
          )
        ) : null}
        <CircleAvatar
          size="sm"
          imageUrl={entry.profileImg ?? undefined}
          tone="cream"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex min-w-0 items-center gap-1.5">
            <Text
              size="caption1"
              weight="bold"
              className="truncate text-gray-800"
            >
              {entry.nickname}
            </Text>
            {entry.isHost ? (
              <span
                className={cn(
                  'bg-main-200 text-main-800 shrink-0 rounded-full',
                  'px-2 py-0.5 text-[10px] font-extrabold'
                )}
              >
                HOST
              </span>
            ) : (
              <span
                className={cn(
                  'shrink-0 rounded-full bg-gray-100 px-2 py-0.5',
                  'text-[10px] font-extrabold text-gray-600'
                )}
              >
                참여 중
              </span>
            )}
          </div>
          {hasRank ? (
            <Text
              size="caption2"
              weight="regular"
              className="truncate text-gray-400"
            >
              {entry.streak ?? 0}일 연속 · 목표 {entry.completedGoalCount ?? 0}개
            </Text>
          ) : null}
        </div>
      </button>
      {hasGoals ? (
        <button
          type="button"
          onClick={onGoals}
          aria-label={`${entry.nickname}님의 목표 보기`}
          className={cn(
            'inline-flex shrink-0 items-center gap-1 rounded-full',
            'px-2.5 py-1 text-[11px] font-bold transition-colors',
            'bg-gray-100 text-gray-600 hover:bg-gray-200/70'
          )}
        >
          <ListChecks className="h-3 w-3" />
          목표
        </button>
      ) : null}
    </div>
  );
}

export function ChallengeLeaderboardCard({
  entries,
  onMemberClick,
  maxRows = 5,
  totalCount,
  onShowAll,
  canPoke = false,
  currentMemberId = null,
  currentNickname = null,
  onPoke,
  pokingMemberId = null,
  pokedMemberIds = [],
}: ChallengeLeaderboardCardProps): React.ReactElement {
  const rows = entries.slice(0, maxRows);
  // 목표 보기 다이얼로그 — 선택된 참여자만 보관해 화면 상태와 분리한다.
  const [goalsOf, setGoalsOf] = useState<LeaderboardEntry | null>(null);
  const displayCount = totalCount ?? entries.length;
  // "전체 보기"는 전체 참여자 목록 화면으로 이동한다(onShowAll 제공 시에만).
  const canShowAll = Boolean(onShowAll) && displayCount > maxRows;

  return (
    <Card radius="lg" className="p-5">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <Text size="heading2" weight="extrabold" className="text-gray-900">
          참여자
        </Text>
        <div className="flex items-center gap-2">
          {displayCount > 0 ? (
            <Text size="caption2" weight="medium" className="text-gray-500">
              {displayCount}명
            </Text>
          ) : null}
          {canShowAll ? (
            <button
              type="button"
              onClick={onShowAll}
              className={cn(
                'shrink-0 rounded-full bg-gray-100 px-2.5 py-1',
                'text-[11px] font-bold text-gray-600',
                'transition-colors hover:bg-gray-200/70'
              )}
            >
              전체 보기
            </button>
          ) : null}
        </div>
      </div>

      {rows.length === 0 ? (
        <Text
          size="body2"
          weight="regular"
          as="p"
          className="block py-2 text-gray-500"
        >
          아직 참여자가 없습니다.
        </Text>
      ) : (
        <ul className="flex flex-col">
          {rows.map((entry, index) => {
            const isLast = index === rows.length - 1;
            // 내 행(=내 프로필)에는 찌르기를 노출하지 않는다.
            // memberId 우선, 미확인 시 닉네임으로 폴백 판별.
            const isMe =
              (currentMemberId !== null &&
                entry.memberId === currentMemberId) ||
              (Boolean(currentNickname) &&
                entry.nickname === currentNickname);
            const showPoke = canPoke && !isMe;
            const isPoking = pokingMemberId === entry.memberId;
            const isPoked = pokedMemberIds.includes(entry.memberId);

            return (
              <li
                key={entry.participantId}
                className={cn(
                  'flex flex-col',
                  !isLast && 'border-b border-gray-100'
                )}
              >
                <MemberRow
                  entry={entry}
                  onSelect={() => onMemberClick?.(entry.memberId)}
                  onGoals={() => setGoalsOf(entry)}
                />

                {showPoke ? (
                  <div className="pt-1 pb-2.5 pl-[2.875rem]">
                    <button
                      type="button"
                      onClick={() => onPoke?.(entry.memberId)}
                      disabled={isPoking || isPoked}
                      aria-label={`${entry.nickname}님 콕 찌르기`}
                      className={cn(
                        'inline-flex items-center gap-1 self-start',
                        'rounded-full px-2.5 py-1 text-[11px] font-bold',
                        'transition-colors',
                        'disabled:cursor-not-allowed disabled:opacity-60',
                        isPoked
                          ? 'bg-gray-100 text-gray-500'
                          : 'bg-main-100 text-main-800 hover:bg-main-200/70'
                      )}
                    >
                      <Pointer className="h-3 w-3" />
                      {isPoked
                        ? '찔렀어요'
                        : isPoking
                          ? '찌르는 중...'
                          : '콕 찌르기'}
                    </button>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <Dialog
        open={goalsOf !== null}
        onOpenChange={(next) => {
          if (!next) {
            setGoalsOf(null);
          }
        }}
      >
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-[420px]">
          <DialogHeader className="flex-col items-start gap-1.5 pb-2">
            <DialogTitle className="text-[17px] font-extrabold tracking-[-0.3px] text-gray-900">
              {goalsOf ? `${goalsOf.nickname}님의 목표` : '목표'}
            </DialogTitle>
          </DialogHeader>
          <DialogBody>
            <ul className="flex flex-col gap-1.5">
              {(goalsOf?.goals ?? []).map((goal, index) => (
                <li
                  key={goal.challengeGoalId}
                  className={cn(
                    'flex items-start gap-2.5 rounded-[10px]',
                    'border border-gray-100 bg-white px-3.5 py-2.5',
                    'lg:bg-gray-50'
                  )}
                >
                  <Text
                    size="body2"
                    weight="extrabold"
                    className="text-main-800"
                  >
                    {index + 1}.
                  </Text>
                  <Text
                    size="body2"
                    weight="medium"
                    className="flex-1 break-keep text-gray-700"
                  >
                    {goal.content}
                  </Text>
                </li>
              ))}
            </ul>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
