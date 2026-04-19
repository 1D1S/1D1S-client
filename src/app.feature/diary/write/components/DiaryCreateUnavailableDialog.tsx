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
      <DialogContent className="w-full max-w-[420px] gap-6 p-6">
        <DialogHeader className="items-center">
          <DialogTitle>
            <Text size="heading1" weight="bold" className="text-black">
              새 일지를 작성할 수 없습니다.
            </Text>
          </DialogTitle>
        </DialogHeader>

        <DialogDescription className="text-center">
          <Text size="body1" weight="regular" className="text-gray-600">
            최근 3일 동안 작성 가능한 날짜를 모두 사용했습니다.
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
