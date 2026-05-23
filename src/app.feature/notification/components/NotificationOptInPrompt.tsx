'use client';

import { ConfirmDialog } from '@feature/member/settings/components/ConfirmDialog';
import React, { useEffect, useRef, useState } from 'react';

import { useUpdateNotificationPreferences } from '../hooks/useNotificationMutations';
import { useNotificationPreferences } from '../hooks/useNotificationQueries';
import { useWebPushSubscription } from '../hooks/useWebPushSubscription';

interface NotificationOptInPromptProps {
  active: boolean;
  onComplete(): void;
}

function shouldRequestBrowserPermission(): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  return Notification.permission === 'default';
}

/**
 * 로그인 직후 서비스 푸시 설정과 브라우저 알림 권한을 함께 점검하는 프롬프트.
 *
 * - pushEnabled === false → 활성화 여부를 묻는 ConfirmDialog 노출.
 *   - 확인: 4개 알림 모두 활성화 + 브라우저 권한 요청 후 onComplete.
 *   - 취소/닫기: 변경 없이 onComplete.
 * - pushEnabled === true → 브라우저 권한이 'default' 면 권한 요청 후 onComplete.
 *   - 'granted' / 'denied' 인 경우엔 즉시 onComplete.
 */
export function NotificationOptInPrompt({
  active,
  onComplete,
}: NotificationOptInPromptProps): React.ReactElement {
  const handled = useRef(false);
  const [dismissed, setDismissed] = useState(false);

  const { data: prefs } = useNotificationPreferences({ enabled: active });
  const { mutate: updatePrefs, isPending } = useUpdateNotificationPreferences();
  const { subscribe } = useWebPushSubscription();

  useEffect(() => {
    if (!active || !prefs || handled.current) {
      return;
    }
    if (!prefs.pushEnabled) {
      // 다이얼로그가 떠서 사용자 액션 시점에 onComplete 가 호출된다.
      return;
    }
    handled.current = true;
    if (shouldRequestBrowserPermission()) {
      void subscribe().finally(onComplete);
      return;
    }
    onComplete();
  }, [active, prefs, onComplete, subscribe]);

  function handleConfirm(): void {
    // prefs 갱신으로 useEffect 가 재실행되어 onComplete 가 중복 호출되는 것을 방지.
    handled.current = true;
    updatePrefs(
      {
        pushEnabled: true,
        friendEnabled: true,
        diaryEnabled: true,
        challengeEnabled: true,
      },
      {
        onSettled: () => {
          setDismissed(true);
          if (shouldRequestBrowserPermission()) {
            void subscribe().finally(onComplete);
            return;
          }
          onComplete();
        },
      }
    );
  }

  function handleCancel(): void {
    handled.current = true;
    setDismissed(true);
    onComplete();
  }

  const isOpen = Boolean(active && prefs && !prefs.pushEnabled && !dismissed);

  return (
    <ConfirmDialog
      open={isOpen}
      onOpenChange={(next) => {
        if (!next && !isPending) {
          handleCancel();
        }
      }}
      tone="brand"
      icon="Bell"
      title="알림을 켤까요?"
      description="친구·일지·챌린지 알림을 한 번에 켜고 실시간 소식을 받아보세요."
      confirmLabel="알림 켜기"
      pendingLabel="설정 중..."
      isPending={isPending}
      isDisabled={false}
      onCancel={handleCancel}
      onConfirm={handleConfirm}
    />
  );
}
