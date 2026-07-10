import { Text } from '@1d1s/design-system';
import { DiaryCardSkeletonGrid } from '@component/skeletons/DiaryCardSkeleton';
import { normalizeApiError } from '@module/api/error';
import React from 'react';

interface DiaryInfiniteFooterProps {
  sentinelRef: React.RefObject<HTMLDivElement | null>;
  isFetchingNextPage: boolean;
  isError: boolean;
  error: unknown;
  hasItems: boolean;
  hasNextPage: boolean;
}

/**
 * 일지 리스트 3개 화면(전체/내/멤버)에서 동일하게 반복되던
 * 무한스크롤 하단부 — 추가 로딩 스켈레톤 + sentinel + 상태 문구.
 */
export function DiaryInfiniteFooter({
  sentinelRef,
  isFetchingNextPage,
  isError,
  error,
  hasItems,
  hasNextPage,
}: DiaryInfiniteFooterProps): React.ReactElement {
  return (
    <>
      {isFetchingNextPage ? (
        <DiaryCardSkeletonGrid count={4} className="mt-4" />
      ) : null}

      <div
        ref={sentinelRef}
        className="mt-6 flex h-10 w-full items-center justify-center"
      >
        {isFetchingNextPage ? null : isError && hasItems ? (
          <Text size="body2" className="text-red-500">
            {error
              ? normalizeApiError(error).message
              : '추가 일지를 불러오지 못했습니다.'}
          </Text>
        ) : hasNextPage ? (
          <div />
        ) : hasItems ? (
          <Text size="body2" className="text-gray-400">
            마지막 일지입니다.
          </Text>
        ) : null}
      </div>
    </>
  );
}
