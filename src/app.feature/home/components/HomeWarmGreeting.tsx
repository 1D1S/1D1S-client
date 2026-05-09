'use client';

import { StreakChip, Text } from '@1d1s/design-system';
import { useSidebar } from '@feature/member/hooks/useMemberQueries';
import React from 'react';

export default function HomeWarmGreeting(): React.ReactElement {
  const { data: sidebar } = useSidebar();
  const nickname = sidebar?.nickname?.trim() ?? '';
  const streakDays = sidebar?.streakCount ?? 0;
  const greetingTitle = nickname
    ? `안녕하세요, ${nickname}님`
    : '안녕하세요';

  return (
    <div className="w-full px-5">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Text
              size="heading2"
              weight="extrabold"
              className="text-gray-900"
            >
              {greetingTitle}
            </Text>
            <span aria-hidden className="animate-float inline-block">
              👋
            </span>
          </div>
          <Text
            size="caption2"
            weight="medium"
            className="mt-1 text-gray-600"
          >
            오늘도 작은 한 걸음을 응원해요.
          </Text>
        </div>
        {streakDays > 0 ? (
          <StreakChip days={streakDays} unit="일" />
        ) : null}
      </div>
    </div>
  );
}
