'use client';

import { Text } from '@1d1s/design-system';
import { SubPageShell } from '@component/layout/SubPageShell';
import { NotificationListSkeleton } from '@component/skeletons/ListItemSkeleton';
import { useInfiniteScroll } from '@module/hooks/useInfiniteScroll';
import { useSafeBack } from '@module/hooks/useSafeBack';
import { cn } from '@module/utils/cn';
import { useMinimumLoading } from '@module/utils/useMinimumLoading';
import { ChevronRight, Megaphone, Pin } from 'lucide-react';
import Link from 'next/link';
import React, { useMemo } from 'react';

import { useNoticesInfinite } from '../hooks/useNoticeQueries';
import { Notice } from '../type/notice';

function EmptyState({ message }: { message: string }): React.ReactElement {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4',
        'rounded-3 border border-gray-200 bg-white py-16'
      )}
    >
      <div
        className={cn(
          'flex h-16 w-16 items-center justify-center',
          'bg-main-200/60 text-main-800 rounded-full'
        )}
      >
        <Megaphone className="h-8 w-8" />
      </div>
      <Text size="body1" weight="medium" className="text-center text-gray-500">
        {message}
      </Text>
    </div>
  );
}

export function NoticeScreen(): React.ReactElement {
  const handleBack = useSafeBack('/');
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useNoticesInfinite();
  const showSkeleton = useMinimumLoading(isLoading);
  const { ref } = useInfiniteScroll({
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    fetchNextPage,
  });

  // 서버가 고정 우선으로 정렬해 내려주므로 응답 순서를 그대로 쓴다.
  // 중복 id 는 페이지 경계에서 새 공지가 끼어들 때만 생기므로 Map 으로 정리.
  const notices = useMemo<Notice[]>(() => {
    const flattened = data?.pages?.flatMap((page) => page?.items ?? []) ?? [];
    const map = new Map<number, Notice>();
    flattened.forEach((notice) => map.set(notice.id, notice));
    return Array.from(map.values());
  }, [data]);

  return (
    <SubPageShell
      title="공지사항"
      description="서비스 업데이트와 안내사항을 확인하세요."
      onBack={handleBack}
    >
      {showSkeleton ? (
        <NotificationListSkeleton count={6} />
      ) : isError ? (
        <EmptyState message="공지사항을 불러오지 못했어요. 잠시 후 다시 시도해 주세요." />
      ) : notices.length === 0 ? (
        <EmptyState message="아직 등록된 공지사항이 없습니다." />
      ) : (
        <>
          <ul
            className={cn(
              'rounded-3 data-fade-in overflow-hidden',
              'border border-gray-200 bg-white',
              'divide-y divide-gray-100'
            )}
          >
            {notices.map((notice) => (
              <li key={notice.id}>
                <Link
                  href={`/notice/${notice.id}`}
                  className={cn(
                    'flex items-center gap-3 px-5 py-4 transition-colors',
                    'hover:bg-gray-50'
                  )}
                >
                  {notice.pinned ? (
                    <span
                      className={cn(
                        'inline-flex shrink-0 items-center gap-1',
                        'bg-main-50 text-main-800 rounded-full',
                        'px-2 py-0.5 text-[11px] font-bold'
                      )}
                    >
                      <Pin className="h-3 w-3" aria-hidden />
                      고정
                    </span>
                  ) : null}
                  <Text
                    size="body1"
                    weight="medium"
                    className="flex-1 truncate text-left text-gray-800"
                  >
                    {notice.title}
                  </Text>
                  <Text
                    size="caption2"
                    weight="regular"
                    className="hidden shrink-0 text-gray-400 sm:block"
                  >
                    {notice.createdAt.slice(0, 10)}
                  </Text>
                  <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
                </Link>
              </li>
            ))}
          </ul>

          {isFetchingNextPage ? (
            <NotificationListSkeleton count={3} className="mt-3" />
          ) : null}

          <div
            ref={ref}
            className="mt-6 flex h-10 w-full items-center justify-center"
          />
        </>
      )}
    </SubPageShell>
  );
}
