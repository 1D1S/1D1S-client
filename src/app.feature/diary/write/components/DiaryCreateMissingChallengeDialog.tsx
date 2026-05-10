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

interface DiaryCreateMissingChallengeDialogProps {
  open: boolean;
  onOpenChange(open: boolean): void;
}

export function DiaryCreateMissingChallengeDialog({
  open,
  onOpenChange,
}: DiaryCreateMissingChallengeDialogProps): React.ReactElement {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>챌린지를 찾을 수 없습니다.</DialogTitle>
        </DialogHeader>
        <DialogBody>
          내 일지 리스트에서 요청한 챌린지를 찾지 못했습니다.
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
