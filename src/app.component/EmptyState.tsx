'use client';

import { Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import React from 'react';

type EmptyStateVariant = 'diary' | 'friends' | 'challenge' | 'generic';

interface EmptyStateProps {
  /** 일러스트 종류 */
  variant?: EmptyStateVariant;
  /** 제목(필수) */
  title: string;
  /** 보조 설명(선택) */
  description?: string;
  /** 하단 액션 영역(버튼/링크 등) */
  action?: React.ReactNode;
  /** 회색 테두리 카드로 감쌀지 여부 */
  bordered?: boolean;
  /** 일러스트 부드러운 플로팅 모션 사용 여부 */
  animate?: boolean;
  /** 좁은 슬롯용 축소 버전 — 일러스트/여백/텍스트를 작게 */
  compact?: boolean;
  /** 외곽 컨테이너 추가 클래스 */
  className?: string;
}

function EmptyIllustration({
  variant,
  size = 88,
}: {
  variant: EmptyStateVariant;
  size?: number;
}): React.ReactElement {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 96 96',
    fill: 'none',
    'aria-hidden': true,
  } as const;

  if (variant === 'friends') {
    return (
      <svg {...common}>
        <circle cx="48" cy="48" r="44" fill="var(--main-200)" />
        <circle
          cx="34"
          cy="40"
          r="11"
          fill="#fff"
          stroke="var(--main-600)"
          strokeWidth="2.5"
        />
        <circle
          cx="62"
          cy="40"
          r="11"
          fill="#fff"
          stroke="var(--main-700)"
          strokeWidth="2.5"
        />
        <path
          d="M20 70c0-9 6-15 14-15s14 6 14 15"
          stroke="var(--main-400)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M48 70c0-9 6-15 14-15s14 6 14 15"
          stroke="var(--main-500)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path d="M44 30l4-4 4 4-4 4z" fill="var(--main-700)" />
      </svg>
    );
  }

  if (variant === 'challenge') {
    return (
      <svg {...common}>
        <circle cx="48" cy="48" r="44" fill="var(--main-200)" />
        <path
          d="M30 30h36v12a18 18 0 0 1-36 0z"
          fill="#fff"
          stroke="var(--main-600)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path
          d="M44 60h8v8h-8z"
          fill="#fff"
          stroke="var(--main-600)"
          strokeWidth="2.5"
        />
        <path
          d="M36 76h24"
          stroke="var(--main-400)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M48 38l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7
             1-5.8-4.2-4.1 5.8-.8z"
          fill="var(--main-700)"
        />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <circle cx="48" cy="48" r="44" fill="var(--main-200)" />
      <rect
        x="28"
        y="30"
        width="40"
        height="50"
        rx="6"
        fill="#fff"
        stroke="var(--main-600)"
        strokeWidth="2.5"
      />
      <path
        d="M36 44h24M36 54h20M36 64h14"
        stroke="var(--main-400)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="68" cy="32" r="13" fill="var(--main-700)" />
      <path
        d="M62 32h12M68 26v12"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function EmptyState({
  variant = 'generic',
  title,
  description,
  action,
  bordered = false,
  animate = true,
  compact = false,
  className,
}: EmptyStateProps): React.ReactElement {
  return (
    <div
      className={cn(
        'flex w-full flex-col items-center justify-center text-center',
        compact ? 'gap-2 px-4 py-4' : 'gap-3 px-6 py-10',
        bordered && 'rounded-3 border border-gray-200',
        className
      )}
    >
      <div className={cn(animate && 'empty-float')}>
        <EmptyIllustration variant={variant} size={compact ? 52 : 88} />
      </div>
      <div className={cn('flex flex-col', compact ? 'gap-1' : 'gap-1.5')}>
        <Text
          size={compact ? 'body2' : 'body1'}
          weight="bold"
          className="text-gray-900"
        >
          {title}
        </Text>
        {description ? (
          <Text
            size={compact ? 'caption1' : 'body2'}
            weight="medium"
            className="text-gray-500"
          >
            {description}
          </Text>
        ) : null}
      </div>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
