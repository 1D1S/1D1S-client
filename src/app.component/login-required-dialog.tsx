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
  description = '좋아요 기능은 로그인 후 이용할 수 있습니다.',
}: LoginRequiredDialogProps): React.ReactElement {
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[380px] gap-6 p-6">
        <DialogHeader className="items-center">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <DialogDescription className="text-center">
          {description}
        </DialogDescription>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            size="medium"
            className="w-full"
            onClick={() => {
              onOpenChange(false);
              router.push('/login');
            }}
          >
            로그인 하러 가기
          </Button>
          <Button
            size="medium"
            variant="ghost"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
