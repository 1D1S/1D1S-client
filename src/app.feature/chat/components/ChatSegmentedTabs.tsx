'use client';

import { cn } from '@module/utils/cn';
import React from 'react';

export interface ChatSegmentedTabsOption<T extends string> {
  value: T;
  label: string;
}

interface ChatSegmentedTabsProps<T extends string> {
  options: ReadonlyArray<ChatSegmentedTabsOption<T>>;
  value: T;
  onChange(value: T): void;
  className?: string;
}

/**
 * 채팅 목록의 셀렉션 그룹.
 *
 * 디자인의 `.tabs > .tab` 을 그대로 옮긴 것이다 — 가로 균등 분할, 알약형,
 * 비활성은 회색 바탕, 활성만 브랜드 색 + 따뜻한 그림자.
 *
 * **채팅 전용이다.** 생김새는 DS `SegmentedControl` 과 닮았지만 그쪽을
 * 고치면 챌린지 생성·수정, 통계, 가입까지 한꺼번에 바뀐다. 그 확산은
 * 별도 결정이라, 여기서는 채팅만 새 스타일을 입는다.
 */
export function ChatSegmentedTabs<T extends string>({
  options,
  value,
  onChange,
  className,
}: ChatSegmentedTabsProps<T>): React.ReactElement {
  return (
    <div role="tablist" className={cn('flex gap-1.5', className)}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex h-9 flex-1 items-center justify-center rounded-full',
              'text-[13.5px] font-bold transition-colors',
              active
                ? 'bg-main-800 text-white shadow-[0_4px_12px_-4px_rgba(255,87,34,0.5)]'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
