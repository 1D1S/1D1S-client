'use client';

import { Card, CircleAvatar, Text } from '@1d1s/design-system';
import EmptyState from '@component/EmptyState';
import { SubPageShell } from '@component/layout/SubPageShell';
import { LoginRequiredDialog } from '@component/LoginRequiredDialog';
import { useIsLoggedIn } from '@feature/member/hooks/useIsLoggedIn';
import { normalizeApiError } from '@module/api/error';
import { useAuthStatus } from '@module/hooks/useAuthStatus';
import { useInfiniteScroll } from '@module/hooks/useInfiniteScroll';
import { useSafeBack } from '@module/hooks/useSafeBack';
import { cn } from '@module/utils/cn';
import { requestNativePushRoute } from '@module/utils/nativeBridge';
import {
  isWithdrawnMember,
  withdrawnDisplayName,
} from '@module/utils/nickname';
import { useMinimumLoading } from '@module/utils/useMinimumLoading';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';

import { Participant, ParticipantSort } from '../../board/type/challenge';
import { ChallengeCompletedBadge } from '../../shared/components/ChallengeCompletedBadge';
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
  const hasRank = typeof participant.rank === 'number' && participant.rank > 0;
  const isHost = participant.status === 'HOST';
  const withdrawn = isWithdrawnMember(participant.nickname);

  return (
    <button
      type="button"
      onClick={withdrawn ? undefined : onClick}
      disabled={withdrawn}
      className={cn(
        'flex w-full items-center gap-3 px-2 py-3 text-left',
        withdrawn
          ? 'cursor-default'
          : 'cursor-pointer transition-colors hover:bg-gray-50'
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
        imageUrl={withdrawn ? undefined : (participant.profileImg ?? undefined)}
        tone="cream"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-1.5">
          <Text size="body2" weight="bold" className="truncate text-gray-800">
            {withdrawnDisplayName(participant.nickname)}
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
          {/* completed 는 nullable — null 이면 딱지 없음(false 와 동일). */}
          {participant.completed ? <ChallengeCompletedBadge /> : null}
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
  const authStatus = useAuthStatus();
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
  // 인증 확인 중(unknown)에도 스켈레톤을 유지한다 — 딥링크/콜드 진입에서
  // 세션 주입 전 게스트로 단정해 로그인 안내가 뜨던 문제 방지(일지 탭과 동일).
  const showSkeleton = useMinimumLoading(isLoading || authStatus === 'unknown');
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

  // 확정된 게스트만 로그인 안내. unknown 은 위 showSkeleton 으로 대기하고,
  // authenticated 는 목록을 그린다(콜드/딥링크에서 세션 준비 전 오판 방지).
  if (authStatus === 'guest') {
    return (
      <LoginRequiredDialog
        open
        onOpenChange={() => {}}
        required
        onClose={() => router.push(`/challenge/${id}`)}
      />
    );
  }

  // 다른 서브페이지(친구/알림/설정 등)와 동일하게 SubPageShell 을 쓴다.
  // → 모바일 헤더(브라우저 back + safe-area, 네이티브에선 globals 규칙으로 숨김)
  //   + data-native-subpage-content(네이티브 바텀/상단 오프셋) + 데스크톱 헤더.
  //   기존엔 이 껍데기 없이 날것으로 그려 상태바 침범·web back 겹침이 났다.
  return (
    <SubPageShell
      title="참여자"
      description="챌린지에 참여 중인 멤버와 등수입니다."
      onBack={handleBack}
    >
      <div className="mx-auto w-full max-w-[640px]">
        {/* 정렬 토글 — 참여순 / 등수순 */}
        <div className="flex items-center justify-between gap-2">
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
                    onClick={() => {
                      const path = `/member/${participant.memberId}`;
                      if (!requestNativePushRoute(path)) {
                        router.push(path);
                      }
                    }}
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
    </SubPageShell>
  );
}
