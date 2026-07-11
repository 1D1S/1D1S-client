'use client';

import {
  CircleAvatar,
  ProgressBar,
  SegmentedControl,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Text,
} from '@1d1s/design-system';
import { useFriendList } from '@feature/friend/hooks/useFriendQueries';
import { normalizeApiError } from '@module/api/error';
import { cn } from '@module/utils/cn';
import React, { useMemo, useState } from 'react';

import { useFriendComparison } from '../hooks/useStatisticsQueries';
import type { FriendComparisonPeriod } from '../type/statistics';
import { formatCount } from '../utils/statisticsView';
import { StatisticsCard } from './StatisticsCard';

const PERIOD_OPTIONS = [
  { value: 'WEEK', label: '주간' },
  { value: 'MONTH', label: '월간' },
];

function Bar({
  value,
  max,
  color,
  caption,
}: {
  value: number;
  max: number;
  color: string;
  caption: string;
}): React.ReactElement {
  const widthPct = max > 0 ? Math.max(4, (value / max) * 100) : 4;
  return (
    <div className="flex items-center gap-2">
      <Text
        size="caption4"
        className="w-16 shrink-0 truncate text-gray-400"
      >
        {caption}
      </Text>
      <ProgressBar
        value={widthPct}
        size="lg"
        showValueText={false}
        fillColor={color}
        trackColor="var(--white)"
        className="flex-1"
        trackClassName="mt-0"
      />
      <Text size="caption3" weight="bold" className="w-8 text-right">
        {formatCount(value)}
      </Text>
    </div>
  );
}

interface CompareRowProps {
  label: string;
  mine: number;
  friendValue: number;
  friendName: string;
}

function CompareRow({
  label,
  mine,
  friendValue,
  friendName,
}: CompareRowProps): React.ReactElement {
  const max = Math.max(mine, friendValue, 1);
  return (
    <div className="rounded-[14px] bg-gray-50 p-4">
      <div className="flex items-center justify-between">
        <Text size="caption1" weight="bold" className="text-gray-900">
          {label}
        </Text>
        <Text size="caption3" className="text-gray-400">
          나 {formatCount(mine)} · {friendName} {formatCount(friendValue)}
        </Text>
      </div>
      <div className="mt-3 space-y-2">
        <Bar value={mine} max={max} color="var(--main-700)" caption="나" />
        <Bar
          value={friendValue}
          max={max}
          color="var(--gray-300)"
          caption={friendName}
        />
      </div>
    </div>
  );
}

/**
 * 친구 비교 — 나 vs 선택한 친구 1:1 (서버 #321).
 * 친구 목록(GET /friends)에서 한 명을 골라 지표를 나란히 비교한다.
 */
export function FriendComparisonSection(): React.ReactElement {
  const [period, setPeriod] = useState<FriendComparisonPeriod>('WEEK');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const {
    data: friends,
    isPending: friendsPending,
    isError: friendsError,
    error: friendsErrorObj,
  } = useFriendList();

  // 선택 전에는 첫 친구를 기본으로 — 별도 effect 없이 파생.
  const effectiveId = selectedId ?? friends?.[0]?.memberId ?? null;
  const selectedFriend = useMemo(
    () => friends?.find((f) => f.memberId === effectiveId),
    [friends, effectiveId]
  );

  const {
    data,
    isPending: comparePending,
    isPlaceholderData,
    isError: compareError,
    error: compareErrorObj,
  } = useFriendComparison(effectiveId, period);

  const hasFriends = (friends?.length ?? 0) > 0;
  const friendName = selectedFriend?.nickname ?? '친구';

  return (
    <StatisticsCard
      title="친구와 나"
      subtitle="친구 한 명을 골라 나와 나란히"
      action={
        hasFriends ? (
          <SegmentedControl
            size="sm"
            options={PERIOD_OPTIONS}
            value={period}
            onValueChange={(v) => setPeriod(v as FriendComparisonPeriod)}
            aria-label="친구 통계 기간"
          />
        ) : undefined
      }
      isLoading={friendsPending}
      isError={friendsError}
      error={friendsErrorObj}
      isEmpty={!friendsPending && !friendsError && !hasFriends}
      emptyText="비교할 친구가 없어요. 친구를 추가해보세요."
      skeletonHeight={220}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CircleAvatar
            size="sm"
            imageUrl={selectedFriend?.profileUrl}
            alt={friendName}
          />
          <div className="min-w-0 flex-1">
            <Select
              value={effectiveId != null ? String(effectiveId) : undefined}
              onValueChange={(v) => setSelectedId(Number(v))}
            >
              <SelectTrigger size="sm" className="w-full">
                <SelectValue placeholder="친구 선택" />
              </SelectTrigger>
              <SelectContent>
                {friends?.map((friend) => (
                  <SelectItem
                    key={friend.memberId}
                    value={String(friend.memberId)}
                  >
                    {friend.nickname}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {compareError ? (
          <div
            className={cn(
              'flex min-h-[120px] items-center justify-center',
              'rounded-[12px] bg-gray-50 px-4 py-8 text-center'
            )}
          >
            <Text size="caption1" className="text-red-500">
              {normalizeApiError(compareErrorObj).message}
            </Text>
          </div>
        ) : (
          // 기간/친구 전환 중(placeholder·로딩)에는 dim, 데이터가 오면
          // opacity 만 부드럽게 복귀 — remount 없는 크로스페이드.
          <div
            className={cn(
              'grid gap-3 transition-opacity duration-300 ease-out',
              'lg:grid-cols-2',
              (isPlaceholderData || (comparePending && !data)) && 'opacity-40'
            )}
          >
            <CompareRow
              label="작성한 일지"
              mine={data?.me.diaryCount ?? 0}
              friendValue={data?.friend.diaryCount ?? 0}
              friendName={friendName}
            />
            <CompareRow
              label="달성한 목표"
              mine={data?.me.completedGoalCount ?? 0}
              friendValue={data?.friend.completedGoalCount ?? 0}
              friendName={friendName}
            />
          </div>
        )}
      </div>
    </StatisticsCard>
  );
}
