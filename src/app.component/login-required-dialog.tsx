import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@1d1s/design-system';
import { useRouter } from 'next/navigation';
import React from 'react';

interface LoginRequiredDialogProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  title?: string;
  description?: string;
}

export function LoginRequiredDialog({
  open,
  onOpenChange,
  title = '로그인이 필요한 서비스입니다.',
  description = '로그인 후 이용할 수 있습니다.',
}: LoginRequiredDialogProps): React.ReactElement {
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-6 px-8 py-6 sm:max-w-[380px] sm:px-6">
        <DialogHeader className="items-center text-center sm:text-center">
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
            onClick={() => onOpenChange(false)}
          >
            닫기
          </Button>
          <Button
            size="medium"
            className="flex-1"
            onClick={() => {
              onOpenChange(false);
              router.push('/login');
            }}
          >
            로그인
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
