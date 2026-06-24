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
import { useAddToHomeScreenTarget } from '@module/hooks/useAddToHomeScreenTarget';
import { NOOP_SUBSCRIBE } from '@module/hooks/useHasMounted';
import { usePathname, useRouter } from 'next/navigation';
import React, { useCallback, useState, useSyncExternalStore } from 'react';

const DISMISS_STORAGE_KEY = '1d1s:addToHomePromptDismissed';
const GUIDE_PATH = '/install';

function readPersistedDismiss(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return localStorage.getItem(DISMISS_STORAGE_KEY) === 'true';
}

/**
 * 모바일 Safari/Chrome 으로 접속한 사용자에게 홈 화면 추가를 권장하는 모달.
 * 인앱 웹뷰나 데스크탑, 이미 standalone 으로 실행된 경우에는 노출되지 않는다.
 *
 * - "가이드 보러가기": /install 가이드 페이지로 라우팅 + 세션 동안 닫는다.
 * - "다시 보지 않기": localStorage 에 영구 dismiss 플래그를 저장한다.
 * - 닫기 동작: 세션 한정으로 닫고, 다음 진입 시 다시 표시된다.
 */
export function AddToHomeScreenPrompt(): React.ReactElement | null {
  const hasMounted = useSyncExternalStore(
    NOOP_SUBSCRIBE,
    () => true,
    () => false
  );

  const router = useRouter();
  const pathname = usePathname();
  const target = useAddToHomeScreenTarget();

  const [persistedOverride, setPersistedOverride] = useState(false);
  const [sessionDismissed, setSessionDismissed] = useState(false);

  const persistedDismiss = hasMounted
    ? persistedOverride || readPersistedDismiss()
    : true;

  const handleGoToGuide = useCallback((): void => {
    setSessionDismissed(true);
    router.push(GUIDE_PATH);
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

  const isOnGuidePage = pathname?.startsWith(GUIDE_PATH) ?? false;

  const isOpen = Boolean(
    target && !persistedDismiss && !sessionDismissed && !isOnGuidePage
  );

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(next) => {
        if (!next) {
          handleClose();
        }
      }}
    >
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>홈 화면에 추가해보세요</DialogTitle>
        </DialogHeader>
        <DialogBody>
          1Day 1Streak 을 홈 화면에 추가하면 앱처럼 더 빠르게 열고, 매일
          챌린지를 잊지 않고 이어갈 수 있어요.
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            size="medium"
            onClick={handleNeverShow}
          >
            다시 보지 않기
          </Button>
          <Button type="button" size="medium" onClick={handleGoToGuide}>
            가이드 보러가기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
