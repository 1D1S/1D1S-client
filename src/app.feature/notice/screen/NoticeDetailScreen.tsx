'use client';

import { Text } from '@1d1s/design-system';
import { SubPageShell } from '@component/layout/SubPageShell';
import { Skeleton } from '@component/Skeleton';
import { DiaryContentRenderer } from '@feature/diary/shared/components/DiaryContentRenderer';
import { useSafeBack } from '@module/hooks/useSafeBack';
import { cn } from '@module/utils/cn';
import { Pin } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { useNotice } from '../hooks/useNoticeQueries';

interface NoticeDetailScreenProps {
  id: string;
}

export function NoticeDetailScreen({
  id,
}: NoticeDetailScreenProps): React.ReactElement {
  const handleBack = useSafeBack('/notice');
  const { data: notice, isLoading, isError } = useNotice(id);

  return (
    <SubPageShell title="공지사항" onBack={handleBack}>
      {isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton shape="text" className="h-6 w-2/3" />
          <Skeleton shape="text" className="h-4 w-1/4" />
          <Skeleton shape="rounded" className="mt-4 h-40 w-full" />
        </div>
      ) : isError || !notice ? (
        // 404(NOTICE-001) 와 일시 오류를 같은 안내로 묶는다. 사용자가 할 수
        // 있는 행동(목록으로 돌아가기)이 동일하다.
        <div
          className={cn(
            'flex flex-col items-center justify-center gap-4',
            'rounded-3 border border-gray-200 bg-white py-16'
          )}
        >
          <Text size="body1" weight="medium" className="text-gray-500">
            공지사항을 찾을 수 없어요.
          </Text>
          <Link
            href="/notice"
            className="text-main-800 text-sm font-bold underline"
          >
            공지사항 목록으로
          </Link>
        </div>
      ) : (
        <article className="data-fade-in">
          <header
            className={cn(
              'flex flex-col gap-3 border-b border-gray-100 pb-5',
              'lg:pb-6'
            )}
          >
            <div className="flex items-center gap-2">
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
              <Text size="caption2" weight="regular" className="text-gray-400">
                {notice.createdAt.slice(0, 10)}
              </Text>
            </div>
            <Text
              as="h1"
              size="heading2"
              weight="extrabold"
              className="tracking-tight text-gray-900"
            >
              {notice.title}
            </Text>
          </header>

          {/* 본문은 어드민 tiptap 이 저장한 HTML. 일지 본문과 같은 렌더러를
              써서 sanitize·코드 하이라이트·문단 간격을 그대로 재사용한다. */}
          <DiaryContentRenderer
            html={notice.content}
            className="mt-6 lg:mt-8"
          />
        </article>
      )}
    </SubPageShell>
  );
}
