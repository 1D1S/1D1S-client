'use client';

import { Icon, Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
// BarChart3 는 DS Icon 에 대응 아이콘이 없어 lucide 유지.
import { BarChart3 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

/**
 * 마이페이지에서 통계 화면으로 진입하는 카드.
 */
export function MyPageStatisticsEntry(): React.ReactElement {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push('/mypage/statistics')}
      className={cn(
        'group flex w-full items-center gap-3 rounded-[14px]',
        'border border-gray-200 bg-white px-4 py-4 text-left',
        'transition-colors hover:bg-gray-50'
      )}
    >
      <span
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center',
          'rounded-full bg-gray-100 text-gray-700'
        )}
        aria-hidden
      >
        <BarChart3 className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <Text as="div" size="body1" weight="medium" className="text-gray-900">
          통계
        </Text>
        <Text as="div" size="caption2" className="text-gray-500">
          감정 분포·작성 추이·친구들과 나
        </Text>
      </div>
      <Icon
        name="ChevronRight"
        size={16}
        className="shrink-0 text-gray-400"
        aria-hidden
      />
    </button>
  );
}
