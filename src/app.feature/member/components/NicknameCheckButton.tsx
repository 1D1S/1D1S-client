'use client';

import { cn } from '@module/utils/cn';
import React from 'react';

interface NicknameCheckButtonProps {
  onClick(): void;
  disabled?: boolean;
  isPending?: boolean;
}

export function NicknameCheckButton({
  onClick,
  disabled,
  isPending,
}: NicknameCheckButtonProps): React.ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isPending}
      className={cn(
        'text-main-800 text-sm font-bold whitespace-nowrap',
        'transition-opacity hover:opacity-70',
        'disabled:cursor-not-allowed disabled:text-gray-300'
      )}
    >
      {isPending ? '확인 중...' : '중복확인'}
    </button>
  );
}
