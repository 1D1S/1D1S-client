'use client';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@1d1s/design-system';
import React from 'react';

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
}: ConfirmDialogProps): React.ReactElement {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="gap-6 px-8 py-6 sm:max-w-[380px] sm:px-6"
      >
        <DialogHeader
          className="items-center text-center sm:text-center"
        >
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <DialogDescription className="block w-full text-center">
          {description}
        </DialogDescription>

        <DialogFooter className="flex-row gap-2">
          <Button
            size="medium"
            variant="ghost"
            className="flex-1"
            onClick={onCancel}
            disabled={isDisabled}
          >
            취소
          </Button>
          <Button
            size="medium"
            className="flex-1"
            onClick={onConfirm}
            disabled={isDisabled}
          >
            {isPending ? pendingLabel : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
