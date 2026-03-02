import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Text,
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
      <DialogContent className="w-full max-w-[420px] gap-6 p-6">
        <DialogHeader className="items-center">
          <DialogTitle>
            <Text size="heading1" weight="bold" className="text-black">
              챌린지를 찾을 수 없습니다.
            </Text>
          </DialogTitle>
        </DialogHeader>

        <DialogDescription className="text-center">
          <Text size="body1" weight="regular" className="text-gray-600">
            내 일지 리스트에서 요청한 챌린지를 찾지 못했습니다.
          </Text>
        </DialogDescription>

        <DialogFooter className="justify-center">
          <DialogClose asChild>
            <Button type="button" size="medium" className="w-32">
              확인
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
