'use client';

import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetTitle,
  Button,
  Text,
} from '@1d1s/design-system';
import { useIsNativeApp } from '@module/hooks/useIsNativeApp';
import { useMobilePlatform } from '@module/hooks/useMobilePlatform';
import { usePathname } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';

import { openAppOrStore } from '../utils/openApp';

// 한 번 닫으면 이 탭을 닫을 때까지 다시 뜨지 않는다. localStorage 로 영구
// 저장하면 "앱을 깔았다가 지운" 사용자에게 영영 안 뜬다 — 세션이 맞다.
const DISMISS_KEY = '1d1s:appPrompt:dismissed';

// 진입 직후 곧바로 시트를 덮으면 사용자가 무엇을 보러 왔는지 알기도 전에
// 선택을 강요받는다. 화면이 한 번 그려질 틈을 준다.
const SHOW_DELAY_MS = 1200;

// 로그인·가입 흐름 중에는 띄우지 않는다 — 진행 중인 절차를 끊는다.
const SUPPRESSED_PREFIXES = ['/login', '/signup', '/auth', '/install'];

function wasDismissed(): boolean {
  try {
    return window.sessionStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

function rememberDismissal(): void {
  try {
    window.sessionStorage.setItem(DISMISS_KEY, '1');
  } catch {
    // 저장이 막힌 환경(프라이빗 모드 등)이면 이번 화면에서만 닫힌다.
  }
}

/**
 * 모바일 웹으로 들어온 사용자에게 앱을 권하는 바텀시트.
 *
 * 데스크톱·네이티브 웹뷰·홈 화면 PWA 에서는 뜨지 않는다.
 */
export function AppInstallPrompt({
  isNativeApp: isNativeAppFromServer = false,
}: {
  isNativeApp?: boolean;
}): React.ReactElement | null {
  const platform = useMobilePlatform();
  const isNativeApp = useIsNativeApp(isNativeAppFromServer);
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // iOS 폴백 타이머는 시트를 닫거나 언마운트될 때 반드시 걷어야 한다 —
  // 남겨 두면 앱에서 돌아온 뒤 뒤늦게 App Store 로 튈 수 있다.
  const cleanupRef = useRef<(() => void) | null>(null);
  useEffect(() => () => cleanupRef.current?.(), []);

  const suppressed =
    isNativeApp ||
    platform === null ||
    SUPPRESSED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  useEffect(() => {
    if (suppressed || wasDismissed()) {
      return undefined;
    }
    const timer = window.setTimeout(() => setOpen(true), SHOW_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [suppressed]);

  if (suppressed) {
    return null;
  }

  const close = (): void => {
    rememberDismissal();
    cleanupRef.current?.();
    cleanupRef.current = null;
    setOpen(false);
  };

  return (
    <BottomSheet
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          close();
        }
      }}
    >
      <BottomSheetContent className="px-5 pb-4">
        <BottomSheetTitle>
          <Text size="body1" weight="extrabold" className="text-gray-900">
            앱에서 더 편하게 이용해 보세요
          </Text>
        </BottomSheetTitle>
        <Text size="body2" className="pt-1.5 text-gray-600">
          1D1S 앱이 있어요. 알림과 홈 화면 위젯으로 스트릭을 놓치지 않게
          도와드려요.
        </Text>

        {/* 버튼은 하나다. 깔려 있으면 앱이 열리고 없으면 스토어로 가는데,
            그 갈림은 사용자가 알 필요도 고를 필요도 없다 — 두 개로 두면
            (특히 미설치 사용자에게) 무엇을 눌러야 할지 되묻게 된다. */}
        <div className="flex flex-col gap-2 pt-5">
          <Button
            size="lg"
            fullWidth
            onClick={() => {
              rememberDismissal();
              cleanupRef.current?.();
              cleanupRef.current = openAppOrStore(platform, pathname);
            }}
          >
            앱으로 열기
          </Button>
          <button
            type="button"
            onClick={close}
            className="h-11 text-gray-500 transition-colors hover:text-gray-700"
          >
            <Text size="body2" weight="medium" className="text-inherit">
              웹으로 계속하기
            </Text>
          </button>
        </div>
      </BottomSheetContent>
    </BottomSheet>
  );
}
