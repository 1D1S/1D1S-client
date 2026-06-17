'use client';

import { Card, CircleAvatar, Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import { Pointer } from 'lucide-react';
import React from 'react';

interface LeaderboardEntry {
  participantId: number;
  memberId: number;
  nickname: string;
  profileImg?: string | null;
  isHost: boolean;
}

interface ChallengeLeaderboardCardProps {
  entries: LeaderboardEntry[];
  onMemberClick?(memberId: number): void;
  maxRows?: number;
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

export function ChallengeLeaderboardCard({
  entries,
  onMemberClick,
  maxRows = 5,
  canPoke = false,
  currentMemberId = null,
  currentNickname = null,
  onPoke,
  pokingMemberId = null,
  pokedMemberIds = [],
}: ChallengeLeaderboardCardProps): React.ReactElement {
  const rows = entries.slice(0, maxRows);

  return (
    <Card radius="lg" className="p-5">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <Text size="heading2" weight="extrabold" className="text-gray-900">
          참여자
        </Text>
        {rows.length > 0 ? (
          <Text size="caption2" weight="medium" className="text-gray-500">
            {rows.length}명
          </Text>
        ) : null}
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
                <button
                  type="button"
                  onClick={() => onMemberClick?.(entry.memberId)}
                  className={cn(
                    'flex w-full cursor-pointer items-center gap-2.5',
                    'rounded-md px-2 py-2.5 text-left transition-colors',
                    'hover:bg-gray-50'
                  )}
                >
                  <CircleAvatar
                    size="sm"
                    imageUrl={entry.profileImg ?? undefined}
                    tone="cream"
                  />
                  <Text
                    size="caption1"
                    weight="bold"
                    className="flex-1 truncate text-gray-800"
                  >
                    {entry.nickname}
                  </Text>
                  {entry.isHost ? (
                    <span
                      className={cn(
                        'bg-main-200 text-main-800 rounded-full',
                        'px-2 py-0.5 text-[10px] font-extrabold'
                      )}
                    >
                      HOST
                    </span>
                  ) : (
                    <span
                      className={cn(
                        'rounded-full bg-gray-100 px-2 py-0.5',
                        'text-[10px] font-extrabold text-gray-600'
                      )}
                    >
                      참여 중
                    </span>
                  )}
                </button>

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
    </Card>
  );
}
