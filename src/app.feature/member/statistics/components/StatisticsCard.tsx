import { Text } from '@1d1s/design-system';
import { Skeleton } from '@component/Skeleton';
import { normalizeApiError } from '@module/api/error';
import { cn } from '@module/utils/cn';
import React from 'react';

interface StatisticsCardProps {
  title: string;
  subtitle?: string;
  /** 제목 우측 컨트롤 (토글 등) */
  action?: React.ReactNode;
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  /** 데이터가 비었는지 (0건) */
  isEmpty?: boolean;
  emptyText?: string;
  /** 로딩 스켈레톤 높이(px) */
  skeletonHeight?: number;
  children: React.ReactNode;
}

function StatisticsMessage({
  tone,
  children,
}: {
  tone: 'error' | 'empty';
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div
      className={cn(
        'flex min-h-[120px] items-center justify-center',
        'rounded-[12px] bg-gray-50 px-4 py-8 text-center'
      )}
    >
      <Text
        size="caption1"
        className={cn(tone === 'error' ? 'text-red-500' : 'text-gray-500')}
      >
        {children}
      </Text>
    </div>
  );
}

/**
 * 통계 섹션 공통 카드 — 헤더 + 로딩/에러/빈 상태 처리.
 */
export function StatisticsCard({
  title,
  subtitle,
  action,
  isLoading,
  isError,
  error,
  isEmpty,
  emptyText = '데이터가 아직 없어요.',
  skeletonHeight = 160,
  children,
}: StatisticsCardProps): React.ReactElement {
  return (
    <section
      className={cn(
        'rounded-[16px] border border-gray-200 bg-white',
        'p-5 lg:p-6'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Text as="h2" size="body1" weight="bold" className="text-gray-900">
            {title}
          </Text>
          {subtitle ? (
            <Text
              as="p"
              size="caption2"
              className="mt-0.5 block text-gray-500"
            >
              {subtitle}
            </Text>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>

      <div className="mt-4">
        {isLoading ? (
          <Skeleton style={{ height: skeletonHeight }} className="w-full" />
        ) : isError ? (
          <StatisticsMessage tone="error">
            {normalizeApiError(error).message}
          </StatisticsMessage>
        ) : isEmpty ? (
          <StatisticsMessage tone="empty">{emptyText}</StatisticsMessage>
        ) : (
          children
        )}
      </div>
    </section>
  );
}
