'use client';

import { Button, Text } from '@1d1s/design-system';
import EmptyState from '@component/EmptyState';
import { SubPageShell } from '@component/layout/SubPageShell';
import { FriendListSkeleton } from '@component/skeletons/ListItemSkeleton';
import { normalizeApiError } from '@module/api/error';
import { notifyApiError } from '@module/api/errorNotify';
import { toast } from '@module/providers/toast';
import { cn } from '@module/utils/cn';
import { useMinimumLoading } from '@module/utils/useMinimumLoading';
import { ChevronRight, Inbox, Send, UserMinus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

import { FriendListItem } from '../components/FriendListItem';
import { useRemoveFriend } from '../hooks/useFriendMutations';
import {
  useFriendList,
  useReceivedFriendRequests,
  useSentFriendRequests,
} from '../hooks/useFriendQueries';

function RequestEntryRow({
  icon,
  label,
  count,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  onClick(): void;
}): React.ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 px-4 py-4 text-left',
        'transition-colors hover:bg-gray-50'
      )}
    >
      <span
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center',
          'rounded-full bg-gray-100 text-gray-700'
        )}
        aria-hidden
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <Text size="body1" weight="medium" className="text-gray-900">
          {label}
        </Text>
      </div>
      {count > 0 ? (
        <span
          className={cn(
            'inline-flex h-6 min-w-6 items-center justify-center',
            'rounded-full bg-red-500 px-2 text-white'
          )}
        >
          <Text size="caption2" weight="bold" className="text-white">
            {count}
          </Text>
        </span>
      ) : null}
      <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
    </button>
  );
}

export default function FriendListScreen(): React.ReactElement {
  const router = useRouter();

  const { data: friends, isLoading, isError, error } = useFriendList();
  const showSkeleton = useMinimumLoading(isLoading);
  const { data: received } = useReceivedFriendRequests();
  const { data: sent } = useSentFriendRequests();
  const removeFriend = useRemoveFriend();

  const friendList = friends ?? [];
  const receivedCount = received?.length ?? 0;
  const sentCount = sent?.length ?? 0;

  const handleRemove = (memberId: number, nickname: string): void => {
    if (!window.confirm(`'${nickname}'님을 친구 목록에서 삭제할까요?`)) {
      return;
    }
    removeFriend.mutate(memberId, {
      onSuccess: () => toast.success('친구가 삭제되었습니다.'),
      onError: notifyApiError,
    });
  };

  return (
    <SubPageShell title="친구">
      {/* 친구 신청 진입 카드 */}
      <section
        className={cn(
          'overflow-hidden rounded-[14px] border border-gray-200 bg-white'
        )}
      >
        <RequestEntryRow
          icon={<Inbox className="h-5 w-5" />}
          label="받은 친구 신청"
          count={receivedCount}
          onClick={() => router.push('/mypage/friend/received')}
        />
        <div className="h-px w-full bg-gray-100" />
        <RequestEntryRow
          icon={<Send className="h-5 w-5" />}
          label="보낸 친구 신청"
          count={sentCount}
          onClick={() => router.push('/mypage/friend/sent')}
        />
      </section>

      {/* 친구 목록 */}
      <section className="mt-6">
        <div className="pb-2">
          <Text
            size="body2"
            weight="bold"
            className="tracking-[-0.2px] text-gray-700"
          >
            친구 {friendList.length}명
          </Text>
        </div>

        {showSkeleton ? (
          <FriendListSkeleton count={5} />
        ) : (
          <div
            className={cn(
              'data-fade-in overflow-hidden bg-white',
              'rounded-[14px] border border-gray-200'
            )}
          >
            {isError ? (
              <div className="flex w-full justify-center py-10">
                <Text size="body2" className="text-red-500">
                  {error
                    ? normalizeApiError(error).message
                    : '친구 목록을 불러오지 못했습니다.'}
                </Text>
              </div>
            ) : friendList.length === 0 ? (
              <EmptyState
                variant="friends"
                title="아직 친구가 없어요"
                description="친구를 추가하고 함께 스트릭을 이어가 보세요"
                className="py-10"
              />
            ) : (
              friendList.map((friend, idx) => (
                <React.Fragment key={friend.memberId}>
                  {idx > 0 ? <div className="ml-16 h-px bg-gray-100" /> : null}
                  <FriendListItem
                    friend={friend}
                    action={
                      <Button
                        variant="ghost"
                        size="sm"
                        iconLeft={<UserMinus className="h-4 w-4" />}
                        disabled={removeFriend.isPending}
                        onClick={() =>
                          handleRemove(friend.memberId, friend.nickname)
                        }
                      >
                        삭제
                      </Button>
                    }
                  />
                </React.Fragment>
              ))
            )}
          </div>
        )}
      </section>
    </SubPageShell>
  );
}
