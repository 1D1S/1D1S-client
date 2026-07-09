'use client';

import { Card, CircleAvatar, Text } from '@1d1s/design-system';
import EmptyState from '@component/EmptyState';
import { LoginRequiredDialog } from '@component/LoginRequiredDialog';
import { useIsLoggedIn } from '@feature/member/hooks/useIsLoggedIn';
import { normalizeApiError } from '@module/api/error';
import { useInfiniteScroll } from '@module/hooks/useInfiniteScroll';
import { useSafeBack } from '@module/hooks/useSafeBack';
import { cn } from '@module/utils/cn';
import { useMinimumLoading } from '@module/utils/useMinimumLoading';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';

import { Participant, ParticipantSort } from '../../board/type/challenge';
import { useChallengeParticipantsInfinite } from '../hooks/useChallengeParticipantQueries';

const PARTICIPANT_PAGE_SIZE = 20;

const SORT_OPTIONS: Array<{ value: ParticipantSort; label: string }> = [
  { value: 'PARTICIPATION', label: '참여순' },
  { value: 'RANK', label: '등수순' },
];

interface ChallengeParticipantListScreenProps {
  id: string;
}

function ParticipantRow({
  participant,
  onClick,
}: {
  participant: Participant;
  onClick(): void;
}): React.ReactElement {
  const hasRank =
    typeof participant.rank === 'number' && participant.rank > 0;
  const isHost = participant.status === 'HOST';

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full cursor-pointer items-center gap-3 px-2 py-3',
        'text-left transition-colors hover:bg-gray-50'
      )}
    >
      <span
        className={cn(
          'flex h-6 w-6 shrink-0 items-center justify-center',
          'text-[13px] font-extrabold tabular-nums',
          !hasRank
            ? 'text-gray-300'
            : participant.rank === 1
              ? 'text-main-800'
              : participant.rank && participant.rank <= 3
                ? 'text-gray-700'
                : 'text-gray-400'
        )}
      >
        {hasRank ? participant.rank : '-'}
      </span>
      <CircleAvatar
        size="sm"
        imageUrl={participant.profileImg ?? undefined}
        tone="cream"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-1.5">
          <Text
            size="body2"
            weight="bold"
            className="truncate text-gray-800"
          >
            {participant.nickname}
          </Text>
          {isHost ? (
            <span
              className={cn(
                'bg-main-200 text-main-800 rounded-full',
                'px-2 py-0.5 text-[10px] font-extrabold'
              )}
            >
              HOST
            </span>
          ) : null}
        </div>
        <Text size="caption2" weight="regular" className="text-gray-400">
          {participant.streak ?? 0}일 연속 · 완료 목표{' '}
          {participant.completedGoalCount ?? 0}개
        </Text>
      </div>
    </button>
  );
}

export function ChallengeParticipantListScreen({
  id,
}: ChallengeParticipantListScreenProps): React.ReactElement {
  const challengeId = Number(id);
  const router = useRouter();
  const handleBack = useSafeBack(`/challenge/${id}`);
  const isLoggedIn = useIsLoggedIn();
  const [sort, setSort] = useState<ParticipantSort>('PARTICIPATION');

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useChallengeParticipantsInfinite(
    challengeId,
    sort,
    PARTICIPANT_PAGE_SIZE,
    isLoggedIn
  );
  const showSkeleton = useMinimumLoading(isLoading);
  const { ref } = useInfiniteScroll({
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    fetchNextPage,
  });

  // 참여자는 participantId 로 유일. 페이지 경계 중복을 방어적으로 제거한다.
  const participants = useMemo(() => {
    const flattened = data?.pages?.flatMap((page) => page?.items ?? []) ?? [];
    const map = new Map<number, Participant>();
    flattened.forEach((participant) => {
      map.set(participant.participantId, participant);
    });
    return Array.from(map.values());
  }, [data]);

  const total = data?.pages?.[0]?.pageInfo.totalElements ?? participants.length;
  const hasParticipants = participants.length > 0;

  if (!isLoggedIn) {
    return (
      <LoginRequiredDialog
        open
        onOpenChange={() => {}}
        required
        onClose={() => router.push(`/challenge/${id}`)}
      />
    );
  }

  return (
    <div className="min-h-screen w-full">
      {/* 모바일 sticky 헤더 */}
      <div
        className={cn(
          'sticky top-0 z-30 flex items-center gap-3',
          'h-14-safe pt-safe-top',
          'border-b border-gray-100 bg-white/95 px-4 backdrop-blur',
          'lg:hidden'
        )}
      >
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={handleBack}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg',
            'text-gray-700 transition-colors hover:bg-gray-100'
          )}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Text
          size="body1"
          weight="extrabold"
          className="flex-1 tracking-[-0.3px] text-gray-900"
        >
          참여자
        </Text>
      </div>

      <div className={cn('mx-auto w-full max-w-[640px]', 'px-5 py-5 lg:py-10')}>
        <header className="hidden flex-col gap-1.5 lg:flex">
          <Text
            size="pageTitle"
            weight="extrabold"
            className="tracking-tight text-gray-900"
          >
            참여자
          </Text>
          <Text size="body2" weight="regular" className="text-gray-500">
            챌린지에 참여 중인 멤버와 등수입니다.
          </Text>
        </header>

        {/* 정렬 토글 — 참여순 / 등수순 */}
        <div className="mt-4 flex items-center justify-between gap-2">
          <Text size="caption1" weight="medium" className="text-gray-500">
            총 {total}명
          </Text>
          <div className="flex gap-1 rounded-full bg-gray-100 p-1">
            {SORT_OPTIONS.map((option) => {
              const isActive = sort === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setSort(option.value)}
                  className={cn(
                    'rounded-full px-3 py-1 text-[12px] font-bold',
                    'transition-colors',
                    isActive
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {isError && !hasParticipants ? (
          <div className="mt-10 flex w-full justify-center py-10">
            <Text size="body1" weight="medium" className="text-red-600">
              {error
                ? normalizeApiError(error).message
                : '참여자를 불러오지 못했습니다.'}
            </Text>
          </div>
        ) : null}

        {!showSkeleton && hasParticipants ? (
          <Card radius="lg" className="data-fade-in mt-4 p-2">
            <ul className="flex flex-col divide-y divide-gray-100">
              {participants.map((participant) => (
                <li key={participant.participantId}>
                  <ParticipantRow
                    participant={participant}
                    onClick={() =>
                      router.push(`/member/${participant.memberId}`)
                    }
                  />
                </li>
              ))}
            </ul>
          </Card>
        ) : null}

        {!showSkeleton && !isError && !hasParticipants ? (
          <EmptyState
            variant="challenge"
            title="아직 참여자가 없어요"
            description="첫 참여자가 되어 보세요"
            className="mt-10"
          />
        ) : null}

        <div
          ref={ref}
          className="mt-6 flex h-10 w-full items-center justify-center"
        >
          {isFetchingNextPage ? (
            <Text size="body2" className="text-gray-400">
              불러오는 중...
            </Text>
          ) : isError && hasParticipants ? (
            <Text size="body2" className="text-red-500">
              추가 참여자를 불러오지 못했습니다.
            </Text>
          ) : !hasNextPage && hasParticipants ? (
            <Text size="body2" className="text-gray-400">
              마지막 참여자입니다.
            </Text>
          ) : null}
        </div>
      </div>
    </div>
  );
}
