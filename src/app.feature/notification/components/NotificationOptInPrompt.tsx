'use client';

import { ConfirmDialog } from '@feature/member/settings/components/ConfirmDialog';
import React, { useEffect, useRef, useState } from 'react';

import { useUpdateNotificationPreferences } from '../hooks/useNotificationMutations';
import { useNotificationPreferences } from '../hooks/useNotificationQueries';

interface NotificationOptInPromptProps {
  active: boolean;
  onComplete(): void;
}

/**
 * 로그인 직후 전체 푸시 알림이 꺼져 있으면 활성화 여부를 묻는 프롬프트.
 *
 * - active 가 true 가 되면 prefs 를 조회한다.
 * - pushEnabled === true 이면 즉시 onComplete 호출 → 후속 redirect 진행.
 * - pushEnabled === false 이면 ConfirmDialog 노출.
 *   - 확인: 4개 알림 모두 활성화 후 onComplete.
 *   - 취소/닫기: 변경 없이 onComplete.
 */
export function NotificationOptInPrompt({
  active,
  onComplete,
}: NotificationOptInPromptProps): React.ReactElement | null {
  const handled = useRef(false);
  const [dismissed, setDismissed] = useState(false);

  const { data: prefs } = useNotificationPreferences({ enabled: active });
  const { mutate: updatePrefs, isPending } =
    useUpdateNotificationPreferences();

  // pushEnabled === true 이면 prompt 노출 없이 바로 onComplete.
  // pushEnabled === false 이면 아래 derived isOpen 으로 다이얼로그가 떠서
  // 사용자 액션 시점에 onComplete 가 호출된다.
  useEffect(() => {
    if (!active || !prefs || handled.current) {
      return;
    }
    handled.current = true;
    if (prefs.pushEnabled) {
      onComplete();
    }
  }, [active, prefs, onComplete]);

  function handleConfirm(): void {
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
          onComplete();
        },
      },
    );
  }

  function handleCancel(): void {
    setDismissed(true);
    onComplete();
  }

  const isOpen = Boolean(
    active && prefs && !prefs.pushEnabled && !dismissed,
  );

  if (!isOpen) {
    return null;
  }

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
