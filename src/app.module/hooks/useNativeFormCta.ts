'use client';

import { useIsNativeApp } from '@module/hooks/useIsNativeApp';
import {
  isNativeFormCtaAvailable,
  type NativeFormCtaAction,
  type NativeFormCtaPayload,
  onNativeFormCtaAction,
  sendNativeFormCta,
} from '@module/utils/nativeBridge';
import React from 'react';

/**
 * 폼 하단 CTA("다음"/"가입 완료")를 네이티브 고정 바로 위임한다.
 *
 * 웹 버튼은 본문 흐름 안에 있어 스크롤하면 같이 밀려 올라간다. 네이티브
 * 쉘에서는 하단에 고정된 버튼이 대신 뜨고, 라벨/비활성 여부는 여기서 계속
 * 갱신한다 — 유효성 규칙(닉네임 중복확인, 관심사 선택 수)의 권위는 웹에 남는다.
 *
 * 반환값이 true 면 네이티브가 CTA 를 그리고 있으니 호출부는 자기 버튼을
 * 숨긴다. 웹/구버전 쉘에서는 false 라 기존 버튼이 그대로 보인다.
 */
export function useNativeFormCta(
  cta: NativeFormCtaPayload,
  onAction: (action: NativeFormCtaAction) => void
): boolean {
  // useIsNativeApp 는 native:ready 를 구독하므로, 핸드셰이크가 늦게 들어와도
  // 그때 다시 평가된다(NativeDatePicker 와 같은 판정).
  const delegate = useIsNativeApp(false) && isNativeFormCtaAvailable();
  const { label, disabled, step, steps } = cta;

  // 핸들러는 매 렌더 바뀌지만(클로저) 구독은 한 번만 건다.
  const actionRef = React.useRef(onAction);
  React.useEffect(() => {
    actionRef.current = onAction;
  });

  React.useEffect(() => {
    if (!delegate) {
      return;
    }
    sendNativeFormCta({ label, disabled, step, steps });
  }, [delegate, label, disabled, step, steps]);

  // 해제는 언마운트에서만. 값이 바뀔 때마다 해제 → 재전송 하면 네이티브
  // 바가 한 프레임 사라졌다 나타난다.
  React.useEffect(() => () => sendNativeFormCta(null), []);

  React.useEffect(() => {
    if (!delegate) {
      return;
    }
    return onNativeFormCtaAction((action) => actionRef.current(action));
  }, [delegate]);

  return delegate;
}
