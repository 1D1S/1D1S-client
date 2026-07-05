'use client';

import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@1d1s/design-system';
import { useIsLoggedIn } from '@feature/member/hooks/useIsLoggedIn';
import { NOOP_SUBSCRIBE } from '@module/hooks/useHasMounted';
import { usePathname, useRouter } from 'next/navigation';
import React, { useCallback, useState, useSyncExternalStore } from 'react';

import { useNotificationPreferences } from '../hooks/useNotificationQueries';
import { useWebPushSubscription } from '../hooks/useWebPushSubscription';

const DISMISS_STORAGE_KEY = '1d1s:browserPushPromptDismissed';
const SETTINGS_PATH = '/mypage/settings/notifications';

type BrowserPermission = 'default' | 'granted' | 'denied' | 'unsupported';

function readBrowserPermission(): BrowserPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

function readPersistedDismiss(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return localStorage.getItem(DISMISS_STORAGE_KEY) === 'true';
}

/**
 * 서버의 푸시 알림 설정은 켜져 있지만 브라우저 알림 권한이 허용되지
 * 않은 경우, 사용자가 권한을 켤 수 있도록 안내하는 모달.
 *
 * - "알림 켜기" (default): 브라우저 권한 요청 + 푸시 구독 등록.
 * - "알림 설정으로 이동" (denied): 인앱 알림 설정 페이지로 라우팅한다.
 *   해당 페이지에서 사이트별 브라우저 설정으로 안내한다.
 * - "다시 보지 않기": localStorage 에 영구 dismiss 플래그를 저장한다.
 * - "닫기": 현재 세션에서만 닫는다. 다음 진입 시 다시 표시된다.
 *
 * 사용자가 이미 알림 설정 페이지에 있을 때는 모달을 표시하지 않는다.
 */
export function BrowserPermissionPrompt(): React.ReactElement {
  const hasMounted = useSyncExternalStore(
    NOOP_SUBSCRIBE,
    () => true,
    () => false
  );

  const router = useRouter();
  const pathname = usePathname();
  const isLoggedIn = useIsLoggedIn();
  const { data: prefs } = useNotificationPreferences({
    enabled: isLoggedIn,
  });
  const { subscribe, status } = useWebPushSubscription();

  const [persistedOverride, setPersistedOverride] = useState(false);
  const [sessionDismissed, setSessionDismissed] = useState(false);

  // hasMounted false 동안엔 SSR 안전 기본값(true)으로 모달을 숨긴다.
  const persistedDismiss = hasMounted
    ? persistedOverride || readPersistedDismiss()
    : true;

  // 구독 시도 후 status 로부터 실효 권한 상태를 파생한다. 별도 useEffect 로
  // setState 를 호출하면 react-hooks/set-state-in-effect 룰에 걸린다.
  const rawPermission: BrowserPermission = hasMounted
    ? readBrowserPermission()
    : 'unsupported';
  const permission: BrowserPermission =
    status === 'subscribed'
      ? 'granted'
      : status === 'denied'
        ? 'denied'
        : rawPermission;

  const handleEnable = useCallback((): void => {
    void subscribe();
  }, [subscribe]);

  const handleGoToSettings = useCallback((): void => {
    setSessionDismissed(true);
    router.push(SETTINGS_PATH);
  }, [router]);

  const handleNeverShow = useCallback((): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(DISMISS_STORAGE_KEY, 'true');
    }
    setPersistedOverride(true);
  }, []);

  const handleClose = useCallback((): void => {
    setSessionDismissed(true);
  }, []);

  const isPending = status === 'loading';
  const isDenied = permission === 'denied';
  const isOnSettingsPage = pathname?.startsWith(SETTINGS_PATH) ?? false;

  const isOpen = Boolean(
    isLoggedIn &&
      prefs?.pushEnabled &&
      permission !== 'granted' &&
      permission !== 'unsupported' &&
      !persistedDismiss &&
      !sessionDismissed &&
      !isOnSettingsPage
  );

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(next) => {
        if (!next && !isPending) {
          handleClose();
        }
      }}
    >
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>브라우저 알림이 꺼져 있어요</DialogTitle>
        </DialogHeader>
        <DialogBody>
          {isDenied
            ? '브라우저에서 알림을 차단했어요. 알림 설정 페이지에서 권한을 다시 켤 수 있어요.'
            : '서버 알림은 켜져 있지만 브라우저 권한이 아직 허용되지 않았어요. 알림을 켜면 실시간으로 소식을 받아볼 수 있어요.'}
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={handleNeverShow}
            disabled={isPending}
          >
            다시 보지 않기
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={handleClose}
            disabled={isPending}
          >
            닫기
          </Button>
          {isDenied ? (
            <Button type="button" size="md" onClick={handleGoToSettings}>
              알림 설정으로 이동
            </Button>
          ) : (
            <Button
              type="button"
              size="md"
              onClick={handleEnable}
              disabled={isPending}
            >
              {isPending ? '설정 중...' : '알림 켜기'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
