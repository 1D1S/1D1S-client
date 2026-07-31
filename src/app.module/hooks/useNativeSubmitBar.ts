'use client';

import { useIsNativeApp } from '@module/hooks/useIsNativeApp';
import {
  isNativeFormCtaAvailable,
  onNativeFormCtaAction,
  sendNativeFormCta,
} from '@module/utils/nativeBridge';
import { useEffect, useRef } from 'react';

/**
 * 폼 하단 제출 CTA 를 네이티브 고정 바로 위임한다(일지 작성/수정·챌린지 생성).
 *
 * 반환값이 true 면 네이티브가 바를 그리고 있으므로, 호출부는 자기
 * MobileBottomActionBar 를 `hidden` 처리하고 하단 spacer(pb-mobile-action-bar)
 * 를 제거한다. 브라우저/구버전 쉘에선 false 라 기존 웹 버튼이 그대로 보인다.
 *
 * label/disabled 가 바뀔 때마다 재전송(전송 중 disabled:true → 연타 방지),
 * 언마운트에서 해제(null)한다. primary 탭은 onPrimary(제출)로 잇는다. 대상
 * 폼은 단일 단계라 back(이전 단계)은 사용하지 않는다.
 *
 * (회원가입 다단계용 useNativeFormCta 와 동일 브릿지를 쓴다 — 추후 통합 가능.)
 */
export function useNativeSubmitBar(
  label: string,
  disabled: boolean,
  onPrimary: () => void
): boolean {
  const isNative = useIsNativeApp(false);
  const delegated = isNative && isNativeFormCtaAvailable();

  // 핸들러는 매 렌더 바뀌지만(클로저) 구독은 한 번만 걸도록 ref 로 최신화한다.
  const primaryRef = useRef(onPrimary);
  useEffect(() => {
    primaryRef.current = onPrimary;
  });

  useEffect(() => {
    if (!delegated) {
      return;
    }
    sendNativeFormCta({ label, disabled });
  }, [delegated, label, disabled]);

  // 해제는 언마운트에서만 — 값이 바뀔 때마다 null→재전송하면 바가 깜빡인다.
  useEffect(
    () => () => {
      sendNativeFormCta(null);
    },
    []
  );

  useEffect(() => {
    if (!delegated) {
      return;
    }
    return onNativeFormCtaAction((action) => {
      if (action === 'primary') {
        primaryRef.current();
      }
    });
  }, [delegated]);

  return delegated;
}
