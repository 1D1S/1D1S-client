'use client';

import {
  ConfirmDialog as DSConfirmDialog,
  type IconName,
} from '@1d1s/design-system';
import { useIsNativeApp } from '@module/hooks/useIsNativeApp';
import { openNativeModal } from '@module/utils/nativeBridge';
import React, { useEffect } from 'react';

type ConfirmTone = 'brand' | 'danger' | 'mint';

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
  tone?: ConfirmTone;
  icon?: IconName;
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
  tone = 'brand',
  icon = 'Flag',
}: ConfirmDialogProps): React.ReactElement | null {
  const isNativeApp = useIsNativeApp(false);

  // 네이티브 쉘에서는 웹 다이얼로그 대신 OS 다이얼로그로 위임한다.
  // LoginRequiredDialog 와 같은 패턴 — 설정의 로그아웃/회원탈퇴만 웹
  // 다이얼로그로 남아 앱 안에서 혼자 웹 UI 로 보였다.
  //
  // dismiss(밖 클릭/시스템 백) 는 취소로 읽는다.
  useEffect(() => {
    if (!isNativeApp || !open) {
      return;
    }
    let cancelled = false;
    void (async () => {
      const result = await openNativeModal({
        title,
        message: description,
        buttons: [
          { label: '취소', value: 'cancel', style: 'cancel' },
          {
            label: confirmLabel,
            value: 'confirm',
            style: tone === 'danger' ? 'destructive' : 'default',
          },
        ],
      });
      if (cancelled) {
        return;
      }
      if (result === 'confirm' && !isPending && !isDisabled) {
        onConfirm();
        return;
      }
      onCancel();
    })();
    return () => {
      cancelled = true;
    };
    // open/isNativeApp 만 본다. isPending 은 확인을 누른 직후 바뀌는데,
    // 의존성에 넣으면 요청 중에 effect 가 다시 돌아 다이얼로그가 두 번
    // 뜬다. 나머지(title/label/핸들러)는 이 다이얼로그가 열려 있는 동안
    // 바뀌지 않는다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNativeApp, open]);

  // 네이티브에서는 Flutter 가 다이얼로그를 직접 그린다.
  if (isNativeApp) {
    return null;
  }

  return (
    <DSConfirmDialog
      open={open}
      onOpenChange={(next) => {
        // 처리 중에는 닫기 요청을 무시 — 무심결의 더블 클릭/외부 클릭으로
        // 인한 dialog 닫힘을 방지한다.
        if (!next && isPending) {
          return;
        }
        onOpenChange(next);
      }}
      tone={tone}
      icon={icon}
      title={title}
      description={description}
      confirmLabel={isPending ? pendingLabel : confirmLabel}
      cancelLabel="취소"
      onConfirm={isPending || isDisabled ? () => undefined : onConfirm}
      onCancel={onCancel}
    />
  );
}
