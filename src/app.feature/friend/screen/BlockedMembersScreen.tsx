'use client';

import { Button, CircleAvatar, Text } from '@1d1s/design-system';
import EmptyState from '@component/EmptyState';
import { SubPageShell } from '@component/layout/SubPageShell';
import { FriendListSkeleton } from '@component/skeletons/ListItemSkeleton';
import { notifyApiError } from '@module/api/errorNotify';
import { useSignalPageReady } from '@module/hooks/useSignalPageReady';
import { toast } from '@module/providers/toast';
import { cn } from '@module/utils/cn';
import {
  isWithdrawnMember,
  withdrawnDisplayName,
} from '@module/utils/nickname';
import { useMinimumLoading } from '@module/utils/useMinimumLoading';
import React from 'react';

import { useUnblockMember } from '../hooks/useFriendMutations';
import { useBlockedMembers } from '../hooks/useFriendQueries';

/**
 * 차단 관리 화면(마이페이지 > 차단 관리). 차단한 회원 목록(GET /friends/block)
 * 을 보여주고, 각 항목에서 차단 해제(DELETE)할 수 있다. 해제하면 서버가 그
 * 사용자의 콘텐츠를 다시 노출하고, 목록도 즉시 갱신된다(훅에서 무효화).
 */
export default function BlockedMembersScreen(): React.ReactElement {
  const { data, isLoading } = useBlockedMembers();
  const showSkeleton = useMinimumLoading(isLoading);
  const blocked = data ?? [];
  const unblock = useUnblockMember();

  useSignalPageReady('blocked_members', !showSkeleton);

  return (
    <SubPageShell title="차단 관리">
      {showSkeleton ? (
        <FriendListSkeleton />
      ) : blocked.length === 0 ? (
        <EmptyState
          variant="friends"
          title="차단한 사용자가 없어요"
          description="차단하면 그 사용자의 일지·댓글·응원이 보이지 않아요."
          className="mt-10"
        />
      ) : (
        <ul className="flex flex-col divide-y divide-gray-100">
          {blocked.map((member) => (
            <li
              key={member.memberId}
              className={cn('flex items-center gap-3 py-3')}
            >
              <CircleAvatar
                size="md"
                imageUrl={
                  isWithdrawnMember(member.nickname)
                    ? undefined
                    : member.profileUrl
                }
                tone="peach"
              />
              <Text
                size="body2"
                weight="bold"
                className="min-w-0 flex-1 truncate text-gray-900"
              >
                {withdrawnDisplayName(member.nickname)}
              </Text>
              <Button
                variant="secondary"
                size="sm"
                disabled={unblock.isPending}
                onClick={() => {
                  unblock.mutate(member.memberId, {
                    onSuccess: () => toast.success('차단을 해제했어요.'),
                    onError: notifyApiError,
                  });
                }}
              >
                차단 해제
              </Button>
            </li>
          ))}
        </ul>
      )}
    </SubPageShell>
  );
}
