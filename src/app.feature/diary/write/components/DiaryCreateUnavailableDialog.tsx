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

interface DiaryCreateUnavailableDialogProps {
  open: boolean;
  onOpenChange(open: boolean): void;
}

export function DiaryCreateUnavailableDialog({
  open,
  onOpenChange,
}: DiaryCreateUnavailableDialogProps): React.ReactElement {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>새 일지를 작성할 수 없습니다.</DialogTitle>
        </DialogHeader>
        <DialogBody>
          최근 3일 동안 작성 가능한 날짜를 모두 사용했습니다.
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" size="medium">
              확인
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
