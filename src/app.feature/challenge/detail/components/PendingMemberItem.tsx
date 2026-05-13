import { Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import { Check, UserRound } from 'lucide-react';
import React from 'react';

interface PendingMemberItemProps {
  name: string;
  joinedAt: string;
  onAccept(): void;
  onReject(): void;
  isLoading: boolean;
}

export function PendingMemberItem({
  name,
  joinedAt,
  onAccept,
  onReject,
  isLoading,
}: PendingMemberItemProps): React.ReactElement {
  return (
    <div
      className={cn(
        'rounded-2 flex items-center justify-between',
        'border border-gray-200 bg-gray-100 px-3 py-2.5'
      )}
    >
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center',
            'rounded-full bg-gray-200 text-gray-500'
          )}
        >
          <UserRound className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <Text size="body2" weight="bold" className="text-gray-900">
            {name}
          </Text>
          <Text size="caption2" weight="regular" className="text-gray-500">
            {joinedAt}
          </Text>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className={cn(
            'bg-main-200 text-main-800 flex h-8 w-8',
            'cursor-pointer items-center justify-center rounded-xl'
          )}
          aria-label="참여 승인"
          onClick={onAccept}
          disabled={isLoading}
        >
          <Check className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={cn(
            'flex h-8 w-8 cursor-pointer items-center justify-center',
            'rounded-xl bg-gray-200 text-gray-500'
          )}
          aria-label="참여 거절"
          onClick={onReject}
          disabled={isLoading}
        >
          ×
        </button>
      </div>
    </div>
  );
}
