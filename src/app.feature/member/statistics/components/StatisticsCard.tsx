import { Card, SectionHeader, Text } from '@1d1s/design-system';
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
  /** 레이아웃과 동일한 형태의 커스텀 스켈레톤 (지정 시 기본 블록 대체) */
  skeleton?: React.ReactNode;
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
  skeleton,
  children,
}: StatisticsCardProps): React.ReactElement {
  return (
    <Card radius="lg" className="p-5 lg:p-6">
      {/* SectionHeader 자체 스케일(max text-lg)로는 마이페이지 헤더
          (heading2)와 급이 안 맞아 title/subtitle 을 Text 로 직접 지정. */}
      <SectionHeader
        title={
          <Text size="heading2" weight="bold" className="text-gray-900">
            {title}
          </Text>
        }
        subtitle={
          subtitle ? (
            <Text size="caption1" weight="regular" className="text-gray-500">
              {subtitle}
            </Text>
          ) : undefined
        }
        action={action}
      />

      <div className="mt-4">
        {isLoading ? (
          (skeleton ?? (
            <Skeleton style={{ height: skeletonHeight }} className="w-full" />
          ))
        ) : isError ? (
          <StatisticsMessage tone="error">
            {normalizeApiError(error).message}
          </StatisticsMessage>
        ) : isEmpty ? (
          <StatisticsMessage tone="empty">{emptyText}</StatisticsMessage>
        ) : (
          // 스켈레톤 → 실데이터 전환 시 mount 되며 페이드 인.
          <div className="data-fade-in">{children}</div>
        )}
      </div>
    </Card>
  );
}
