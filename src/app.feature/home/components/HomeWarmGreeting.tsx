'use client';

import { StreakChip, Text } from '@1d1s/design-system';
import { useSidebar } from '@feature/member/hooks/useMemberQueries';
import { cn } from '@module/utils/cn';
import React from 'react';

export default function HomeWarmGreeting(): React.ReactElement {
  const { data: sidebar } = useSidebar();
  const nickname = sidebar?.nickname?.trim() ?? '';
  const streakDays = sidebar?.streakCount ?? 0;
  const greetingTitle = nickname
    ? `안녕하세요, ${nickname}님`
    : '안녕하세요';

  return (
    // min-h 로 두 줄 분량을 미리 확보해 닉네임/스트릭이 뒤늦게 들어와도
    // 아래 컴포넌트를 밀어내지 않도록 한다.
    <div className="min-h-[64px] w-full">
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
        {/* StreakChip 자리는 항상 동일한 폭으로 예약. 데이터가 없으면 invisible. */}
        <div
          className={cn(
            'shrink-0',
            streakDays > 0 ? 'visible' : 'invisible'
          )}
          aria-hidden={streakDays === 0}
        >
          <StreakChip days={streakDays > 0 ? streakDays : 0} unit="일" />
        </div>
      </div>
    </div>
  );
}
