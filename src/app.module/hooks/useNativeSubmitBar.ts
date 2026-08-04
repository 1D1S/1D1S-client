'use client';

import { useNativeCapability } from '@module/hooks/useNativeCapability';
import {
  isNativeFormCtaAvailable,
  onNativeFormCtaAction,
  sendNativeFormCta,
} from '@module/utils/nativeBridge';
import { useEffect, useRef } from 'react';

interface NativeSubmitBarOptions {
  /** 다단계 폼의 현재 단계(1-base). 회원가입 등에서만 사용. */
  step?: number;
  /** 다단계 폼의 총 단계 수. */
  steps?: number;
  /** back 탭 콜백(이전 단계 등). 없으면 back 은 무시된다. */
  onBack?(): void;
  /**
   * 비활성 사유(첫 미충족 필수 항목 안내). disabled 일 때 앱이 노출한다.
   * 활성이면 무시된다. 값이 바뀌면 재전송한다.
   */
  disabledHint?: string;
}

/**
 * 폼 하단 제출 CTA 를 네이티브 고정 바로 위임한다(일지 작성/수정·챌린지 생성·
 * 회원가입 스텝 등).
 *
 * 반환값이 true 면 네이티브가 바를 그리고 있으므로, 호출부는 자기 웹 버튼(및
 * MobileBottomActionBar/하단 spacer)을 숨긴다. 브라우저/구버전 쉘에선 false 라
 * 기존 웹 버튼이 그대로 보인다.
 *
 * label/disabled/step/steps 가 바뀔 때마다 재전송(전송 중 disabled:true → 연타
 * 방지), 언마운트에서 해제(null)한다. primary 탭 → onPrimary, back 탭 → onBack.
 * 다단계 폼은 스텝별로 이 훅을 호출하고(한 번에 한 스텝만 마운트) step/steps 를
 * 넘기면 네이티브가 단계 표시를 그린다.
 */
export function useNativeSubmitBar(
  label: string,
  disabled: boolean,
  onPrimary: () => void,
  options?: NativeSubmitBarOptions
): boolean {
  // native:ready 로 form_cta 피처가 늦게 주입돼도 재평가되도록 반응형으로 읽는다.
  const delegated = useNativeCapability(isNativeFormCtaAvailable);
  const step = options?.step;
  const steps = options?.steps;
  const onBack = options?.onBack;
  const disabledHint = options?.disabledHint;

  // 핸들러는 매 렌더 바뀌지만(클로저) 구독은 한 번만 걸도록 ref 로 최신화한다.
  const primaryRef = useRef(onPrimary);
  const backRef = useRef(onBack);
  useEffect(() => {
    primaryRef.current = onPrimary;
    backRef.current = onBack;
  });

  useEffect(() => {
    if (!delegated) {
      return;
    }
    sendNativeFormCta({ label, disabled, disabledHint, step, steps });
  }, [delegated, label, disabled, disabledHint, step, steps]);

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
      } else if (action === 'back') {
        backRef.current?.();
      }
    });
  }, [delegated]);

  return delegated;
}
