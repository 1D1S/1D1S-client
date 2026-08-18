'use client';

import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetTitle,
  Button,
  Text,
} from '@1d1s/design-system';
import {
  APP_STORE_URL,
  buildAndroidIntentUrl,
  isDeepLinkablePath,
  PLAY_STORE_URL,
} from '@constants/appStore';
import { useIsNativeApp } from '@module/hooks/useIsNativeApp';
import {
  type MobilePlatform,
  useMobilePlatform,
} from '@module/hooks/useMobilePlatform';
import { cn } from '@module/utils/cn';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';

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
 * 앱을 연다.
 *
 * Android 는 `intent://` 가 **설치 여부를 브라우저가 판단**해 준다 —
 * 있으면 앱, 없으면 스토어. iOS 는 설치 여부를 알아낼 방법이 없어(스킴
 * 시도 + 타이머 트릭은 오탐이 잦고 Safari 가 경고창을 띄운다) 스토어로
 * 보낸다. Universal Links(FR) 가 올라가면 링크 탭 자체가 앱으로 열리므로
 * 이 버튼의 역할은 미설치 사용자 안내로 좁혀진다.
 */
function openApp(platform: MobilePlatform, pathname: string): void {
  if (platform === 'android') {
    const target = new URL(window.location.href);
    // 앱이 받지 못하는 경로는 앱 홈으로 보낸다 — 앱만 열리고 엉뚱한 화면에
    // 떨어지는 것보다 낫다.
    if (!isDeepLinkablePath(pathname)) {
      target.pathname = '/';
      target.search = '';
    }
    window.location.href = buildAndroidIntentUrl(target);
    return;
  }
  window.location.href = APP_STORE_URL;
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
    setOpen(false);
  };

  const storeUrl = platform === 'android' ? PLAY_STORE_URL : APP_STORE_URL;

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

        <div className="flex flex-col gap-2 pt-5">
          <Button
            size="lg"
            fullWidth
            onClick={() => {
              rememberDismissal();
              openApp(platform, pathname);
            }}
          >
            앱으로 열기
          </Button>
          <a
            href={storeUrl}
            target="_blank"
            rel="noreferrer noopener"
            onClick={rememberDismissal}
            className={cn(
              'flex h-11 items-center justify-center rounded-xl',
              'text-gray-600 transition-colors hover:bg-gray-50'
            )}
          >
            <Text size="body2" weight="medium" className="text-inherit">
              {platform === 'android' ? 'Play 스토어' : 'App Store'}에서 보기
            </Text>
          </a>
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
