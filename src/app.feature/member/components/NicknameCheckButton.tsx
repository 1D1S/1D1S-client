'use client';

import { Button } from '@1d1s/design-system';
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
    <Button
      type="button"
      variant="soft"
      size="sm"
      onClick={onClick}
      disabled={disabled || isPending}
      className="pointer-events-auto shrink-0 whitespace-nowrap"
    >
      {isPending ? '확인 중...' : '중복확인'}
    </Button>
  );
}
