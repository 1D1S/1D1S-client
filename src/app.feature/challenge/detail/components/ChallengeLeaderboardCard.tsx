'use client';

import { Card, CircleAvatar, Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
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
}

export function ChallengeLeaderboardCard({
  entries,
  onMemberClick,
  maxRows = 5,
}: ChallengeLeaderboardCardProps): React.ReactElement {
  const rows = entries.slice(0, maxRows);

  return (
    <Card radius="lg" className="p-5">
      <div className="mb-3 flex items-center gap-1.5">
        <span aria-hidden className="text-base leading-none">
          🏆
        </span>
        <Text size="heading2" weight="extrabold" className="text-gray-900">
          리더보드
        </Text>
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
            const rank = index + 1;
            const isFirst = rank === 1;
            const isLast = index === rows.length - 1;

            return (
              <li
                key={entry.participantId}
                className={cn(
                  'flex items-center gap-2.5 py-2',
                  !isLast && 'border-b border-gray-100'
                )}
              >
                <button
                  type="button"
                  onClick={() =>
                    onMemberClick?.(entry.memberId)
                  }
                  className={cn(
                    'flex w-full cursor-pointer items-center gap-2.5',
                    'rounded-md text-left transition-colors',
                    'hover:bg-gray-50'
                  )}
                >
                  <span
                    className={cn(
                      'w-6 text-center text-[12px] font-extrabold',
                      isFirst ? 'text-[#ff9800]' : 'text-gray-500'
                    )}
                  >
                    {rank}
                  </span>
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
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
