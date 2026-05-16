'use client';

import { Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import { ChevronRight, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

import {
  useFriendList,
  useReceivedFriendRequests,
} from '../hooks/useFriendQueries';

/**
 * 마이페이지에서 친구 목록으로 진입하는 카드.
 * 친구 수와 받은 신청 건수를 함께 노출한다.
 */
export function MyPageFriendsEntry(): React.ReactElement {
  const router = useRouter();
  const { data: friends } = useFriendList();
  const { data: received } = useReceivedFriendRequests();

  const friendCount = friends?.length ?? 0;
  const receivedCount = received?.length ?? 0;

  return (
    <button
      type="button"
      onClick={() => router.push('/mypage/friend')}
      className={cn(
        'group flex w-full items-center gap-3 rounded-[14px]',
        'border border-gray-200 bg-white px-4 py-4 text-left',
        'transition-colors hover:bg-gray-50',
      )}
    >
      <span
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center',
          'rounded-full bg-gray-100 text-gray-700',
        )}
        aria-hidden
      >
        <Users className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <Text as="div" size="body1" weight="medium" className="text-gray-900">
          친구
        </Text>
        <Text as="div" size="caption2" className="text-gray-500">
          {friendCount > 0 ? `친구 ${friendCount}명` : '친구를 추가해보세요'}
        </Text>
      </div>
      {receivedCount > 0 ? (
        <span
          className={cn(
            'inline-flex h-6 items-center justify-center',
            'rounded-full bg-red-500 px-2 text-white',
          )}
        >
          <Text size="caption2" weight="bold" className="text-white">
            받은 신청 {receivedCount}
          </Text>
        </span>
      ) : null}
      <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
    </button>
  );
}
