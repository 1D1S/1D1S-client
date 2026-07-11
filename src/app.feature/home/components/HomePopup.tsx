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
import { cn } from '@module/utils/cn';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { useActivePopups } from '../hooks/usePopupQueries';
import {
  dismissPopupKeys,
  getDismissedPopupKeys,
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

  // 쿠키에 등록된(=다시 보지 않기) key 는 마운트 시 1회만 읽는다.
  const [dismissedKeys] = useState(() => new Set(getDismissedPopupKeys()));
  const [closed, setClosed] = useState(false);
  const [index, setIndex] = useState(0);

  // 노출 대상 = 응답 팝업 중 쿠키에 없는 것. 시작일 오름차순은 서버가 보장.
  const visiblePopups = popups.filter(
    (popup) => popup.imageUrl && !dismissedKeys.has(popup.popupKey)
  );
  const count = visiblePopups.length;

  // 노출 대상이 2개 이상이면 3초 간격으로 순환 슬라이드.
  useEffect(() => {
    if (closed || count < 2) {
      return;
    }
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % count);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [closed, count]);

  if (closed || count === 0) {
    return null;
  }

  const safeIndex = index % count;
  const current = visiblePopups[safeIndex];

  const close = (): void => setClosed(true);

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
    <Dialog open onOpenChange={(open) => !open && close()}>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent
          className={cn(
            'fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
            'w-auto max-w-[92vw] rounded-2xl bg-white px-5 pt-5 pb-4'
          )}
        >
          <DialogTitle className="sr-only">이벤트 팝업</DialogTitle>
          <DialogDescription className="sr-only">
            {current.ctaText}
          </DialogDescription>
          <div className="relative h-[200px] w-[200px] overflow-hidden rounded-xl bg-gray-100">
            <FadeInImage
              src={current.imageUrl}
              alt=""
              fill
              sizes="200px"
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
          </div>
          <div className="mt-4 flex w-[200px] gap-2">
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
