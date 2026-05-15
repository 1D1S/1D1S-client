import { ConfirmDialog } from '@1d1s/design-system';
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
