import {
  Button,
  ConfirmDialog,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  Icon,
  Text,
} from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import { useRouter } from 'next/navigation';
import React from 'react';

interface LoginRequiredDialogProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  title?: string;
  description?: string;
  /**
   * 강제 모드. true 면 배경/ESC 로 닫을 수 없고, 닫기 버튼은 `onClose` 를
   * 호출한다 (예: 보호된 상세 페이지에서 상위 리스트로 이동).
   */
  required?: boolean;
  /** required 모드의 닫기 동작. */
  onClose?(): void;
}

export function LoginRequiredDialog({
  open,
  onOpenChange,
  title = '로그인이 필요한 서비스입니다.',
  description = '로그인 후 이용할 수 있습니다.',
  required = false,
  onClose,
}: LoginRequiredDialogProps): React.ReactElement {
  const router = useRouter();

  if (!required) {
    return (
      <ConfirmDialog
        open={open}
        onOpenChange={onOpenChange}
        tone="brand"
        icon="LogIn"
        title={title}
        description={description}
        confirmLabel="로그인"
        cancelLabel="닫기"
        onConfirm={() => router.push('/login')}
      />
    );
  }

  return (
    <Dialog open={open}>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent
          showClose={false}
          onPointerDownOutside={(event) => event.preventDefault()}
          onEscapeKeyDown={(event) => event.preventDefault()}
          className={cn(
            'fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
            'w-[360px] max-w-[92vw] rounded-[18px] bg-white',
            'px-[22px] pt-6 pb-[18px] text-center',
            'shadow-[0_24px_64px_rgba(0,0,0,0.18)]'
          )}
        >
          <div
            className={cn(
              'mx-auto mb-3.5 flex h-14 w-14 items-center justify-center',
              'bg-main-200 rounded-full'
            )}
          >
            <Icon name="LogIn" size={26} className="text-brand" />
          </div>
          <DialogTitle asChild>
            <Text
              size="body2"
              weight="extrabold"
              className="block tracking-[-0.3px] text-black"
            >
              {title}
            </Text>
          </DialogTitle>
          <DialogDescription asChild>
            <Text
              size="caption2"
              weight="regular"
              className={cn(
                'mt-1.5 block leading-[1.55] whitespace-pre-line',
                'text-gray-600'
              )}
            >
              {description}
            </Text>
          </DialogDescription>
          <div className="mt-[18px] flex gap-2">
            <Button
              variant="secondary"
              className="h-11 flex-1 rounded-[10px]"
              onClick={() => onClose?.()}
            >
              닫기
            </Button>
            <Button
              variant="primary"
              className="h-11 flex-1 rounded-[10px]"
              onClick={() => router.push('/login')}
            >
              로그인
            </Button>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
