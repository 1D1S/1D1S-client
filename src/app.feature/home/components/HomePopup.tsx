'use client';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@1d1s/design-system';
import FadeInImage from '@component/FadeInImage';
import { useIsNativeApp } from '@module/hooks/useIsNativeApp';
import { cn } from '@module/utils/cn';
import { openNativePopup } from '@module/utils/nativeBridge';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';

import { useActivePopups } from '../hooks/usePopupQueries';
import {
  dismissPopupKeys,
  getDismissedPopupKeys,
  getSessionDismissedPopupKeys,
  sessionDismissPopupKeys,
} from '../utils/popupDismissal';

const SLIDE_INTERVAL_MS = 3_000;

interface HomePopupProps {
  /** 로그인 사용자에게만 노출. false 면 조회하지 않는다. */
  enabled: boolean;
}

export default function HomePopup({
  enabled,
}: HomePopupProps): React.ReactElement | null {
  const router = useRouter();
  const { data: popups = [] } = useActivePopups(enabled);

  // 차단 대상 key 는 마운트 시 1회만 읽는다.
  // 쿠키(다시 보지 않기, 영구) + sessionStorage(그냥 닫기, 세션 한정).
  const [dismissedKeys] = useState(
    () =>
      new Set([
        ...getDismissedPopupKeys(),
        ...getSessionDismissedPopupKeys(),
      ])
  );
  const [closed, setClosed] = useState(false);
  const [index, setIndex] = useState(0);
  const isNativeApp = useIsNativeApp(false);
  // 네이티브 쉘이 popup_open 을 모르면(구버전) null 이 돌아온다 → 웹 팝업으로
  // 폴백한다.
  const [nativeUnavailable, setNativeUnavailable] = useState(false);
  const nativeRequested = useRef(false);

  // 노출 대상 = 응답 팝업 중 쿠키에 없는 것. 시작일 오름차순은 서버가 보장.
  const visiblePopups = popups.filter(
    (popup) => popup.imageUrl && !dismissedKeys.has(popup.popupKey)
  );
  const count = visiblePopups.length;

  // 노출 대상이 2개 이상이면 3초 간격으로 순환 슬라이드.
  // 네이티브가 그리는 동안은 Flutter 쪽 타이머가 순환을 맡으므로 돌리지 않는다.
  useEffect(() => {
    if (closed || count < 2 || (isNativeApp && !nativeUnavailable)) {
      return;
    }
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % count);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [closed, count, isNativeApp, nativeUnavailable]);

  // 네이티브 쉘에서는 팝업을 Flutter 가 그린다. 웹 다이얼로그는 WebView 안에
  // 갇혀 네이티브 헤더/바텀바를 덮지 못하기 때문 — z-index 로는 해결이 안 되는
  // 구조적 제약이다.
  //
  // 표시만 네이티브에 맡기고 판단은 여기 그대로 둔다. "다시 보지 않기" 쿠키와
  // 세션 차단 규칙(popupDismissal), CTA 이동 규칙이 두 곳으로 갈라지면 언젠가
  // 반드시 어긋난다.
  useEffect(() => {
    if (!isNativeApp || closed || count === 0 || nativeRequested.current) {
      return;
    }
    nativeRequested.current = true;
    let cancelled = false;
    void (async () => {
      const shown = visiblePopups;
      const keys = shown.map((popup) => popup.popupKey);
      const outcome = await openNativePopup(
        shown.map((popup) => ({
          popupKey: popup.popupKey,
          imageUrl: popup.imageUrl,
          ctaText: popup.ctaText,
          linkUrl: popup.linkUrl,
        }))
      );
      if (cancelled) {
        return;
      }
      if (!outcome) {
        setNativeUnavailable(true);
        return;
      }
      if (outcome.action === 'dismissForever') {
        dismissPopupKeys(keys);
      }
      sessionDismissPopupKeys(keys);
      setClosed(true);
      if (outcome.action === 'cta') {
        // 캐러셀이 돌기 때문에 CTA 를 누른 장은 첫 장이 아닐 수 있다.
        const target =
          shown.find((popup) => popup.popupKey === outcome.popupKey) ??
          shown[0];
        if (/^https?:\/\//i.test(target.linkUrl)) {
          window.open(target.linkUrl, '_blank', 'noopener,noreferrer');
        } else {
          router.push(target.linkUrl);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // visiblePopups 는 렌더마다 새 배열이라 의존성에 넣으면 매번 다시 연다.
    // count 가 그 내용 변화를 대신 잡고, nativeRequested 가 중복을 막는다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNativeApp, closed, count]);

  if (count === 0) {
    return null;
  }

  // 네이티브가 그리는 동안 웹 팝업은 아무것도 그리지 않는다.
  if (isNativeApp && !nativeUnavailable) {
    return null;
  }

  const safeIndex = index % count;
  const current = visiblePopups[safeIndex];

  // 닫을 때(그냥 닫기·CTA·다시 보지 않기 공통) 현재 노출된 전체 팝업 key 를
  // 세션 차단 목록에 기록해 같은 세션에서 재진입해도 다시 뜨지 않게 한다.
  const close = (): void => {
    sessionDismissPopupKeys(visiblePopups.map((popup) => popup.popupKey));
    setClosed(true);
  };

  // "다시 보지 않기": 현재 노출된 모든 팝업 key 를 쿠키에 등록 후 닫는다.
  const handleDismiss = (): void => {
    dismissPopupKeys(visiblePopups.map((popup) => popup.popupKey));
    close();
  };

  // CTA: 외부 URL 은 새 탭(noopener), 내부 경로는 클라이언트 이동.
  const handleCta = (): void => {
    if (/^https?:\/\//i.test(current.linkUrl)) {
      window.open(current.linkUrl, '_blank', 'noopener,noreferrer');
    } else {
      router.push(current.linkUrl);
    }
    close();
  };

  return (
    <Dialog open={!closed} onOpenChange={(open) => !open && close()}>
      <DialogPortal>
        <DialogOverlay
          className={cn(
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0'
          )}
        />
        <DialogContent
          className={cn(
            'fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
            'w-[min(500px,90vw)] rounded-2xl bg-white px-5 pt-5 pb-4',
            'duration-200',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
            'data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95'
          )}
        >
          <DialogTitle className="sr-only">이벤트 팝업</DialogTitle>
          <DialogDescription className="sr-only">
            {current.ctaText}
          </DialogDescription>
          <button
            type="button"
            onClick={handleCta}
            className="relative aspect-square w-full cursor-pointer overflow-hidden rounded-xl bg-gray-100"
          >
            <FadeInImage
              src={current.imageUrl}
              alt=""
              fill
              sizes="(max-width: 540px) 90vw, 500px"
              className="object-cover"
            />
            {count >= 2 && (
              <span
                className={cn(
                  'absolute right-2 bottom-2 rounded-full',
                  'bg-black/60 px-2 py-0.5 text-xs text-white'
                )}
              >
                {safeIndex + 1}/{count}
              </span>
            )}
          </button>
          <div className="mt-4 flex w-full gap-2">
            <Button
              variant="secondary"
              className="h-11 flex-1 rounded-[10px]"
              onClick={handleDismiss}
            >
              다시 보지 않기
            </Button>
            <Button
              variant="primary"
              className="h-11 flex-1 rounded-[10px]"
              onClick={handleCta}
            >
              {current.ctaText}
            </Button>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
