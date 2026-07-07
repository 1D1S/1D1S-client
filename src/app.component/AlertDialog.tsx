'use client';

import {
  Button,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@1d1s/design-system';
import React from 'react';

interface AlertDialogProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  onConfirm?(): void;
}

/**
 * 단일 확인 버튼만 있는 알림 다이얼로그.
 * 본문이 메시지 한 줄로 충분한 경우에 사용한다. 분기·폼이 필요한 경우는
 * 별도 다이얼로그 컴포넌트를 작성한다.
 */
export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = '확인',
  onConfirm,
}: AlertDialogProps): React.ReactElement {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* 본문이 DialogDescription 이 아니므로 Radix 경고 억제 */}
      <DialogContent size="sm" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DialogBody>{description}</DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" size="md" onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
