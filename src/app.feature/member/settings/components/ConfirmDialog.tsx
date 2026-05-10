'use client';

import {
  ConfirmDialog as DSConfirmDialog,
  type IconName,
} from '@1d1s/design-system';
import React from 'react';

type ConfirmTone = 'brand' | 'danger' | 'mint';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  title: string;
  description: string;
  confirmLabel: string;
  pendingLabel: string;
  isPending: boolean;
  isDisabled: boolean;
  onCancel(): void;
  onConfirm(): void;
  tone?: ConfirmTone;
  icon?: IconName;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  pendingLabel,
  isPending,
  isDisabled,
  onCancel,
  onConfirm,
  tone = 'brand',
  icon = 'Flag',
}: ConfirmDialogProps): React.ReactElement {
  return (
    <DSConfirmDialog
      open={open}
      onOpenChange={(next) => {
        // 처리 중에는 닫기 요청을 무시 — 무심결의 더블 클릭/외부 클릭으로
        // 인한 dialog 닫힘을 방지한다.
        if (!next && isPending) {
          return;
        }
        onOpenChange(next);
      }}
      tone={tone}
      icon={icon}
      title={title}
      description={description}
      confirmLabel={isPending ? pendingLabel : confirmLabel}
      cancelLabel="취소"
      onConfirm={isPending || isDisabled ? () => undefined : onConfirm}
      onCancel={onCancel}
    />
  );
}
