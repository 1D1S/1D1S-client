'use client';

import { DatePicker, type DatePickerProps } from '@1d1s/design-system';
import { useIsNativeApp } from '@module/hooks/useIsNativeApp';
import {
  isNativeDatePickerAvailable,
  openNativeDatePicker,
} from '@module/utils/nativeBridge';
import React from 'react';

// 하루씩 훑어 disabled 목록을 만들 때의 상한. min~max 가 이보다 넓으면
// 목록을 보내지 않는다 (현재 사용처는 일지 작성의 3일 창뿐).
const MAX_DISABLED_SCAN_DAYS = 62;

function toLocalDateString(date: Date): string {
  const y = String(date.getFullYear()).padStart(4, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function fromLocalDateString(value: string): Date | undefined {
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) {
    return undefined;
  }
  return new Date(y, m - 1, d);
}

interface NativeDatePickerProps extends DatePickerProps {
  /** 네이티브 피커의 선택 하한 (없으면 제한 없음). */
  nativeMin?: Date;
  /** 네이티브 피커의 선택 상한 (없으면 제한 없음). */
  nativeMax?: Date;
  /**
   * 개별 비활성 날짜 판정. min/max 가 모두 있고 창이 좁을 때만 하루씩
   * 평가해 네이티브로 보낸다 — 함수는 브릿지로 직렬화할 수 없다.
   */
  nativeIsDisabled?(date: Date): boolean;
}

/**
 * DS DatePicker 의 네이티브 위임 래퍼. 웹 캘린더 시트는 WebView 안에 갇혀
 * 아래가 잘리고 네이티브 헤더도 못 가린다. 네이티브 쉘에서는 트리거 위에
 * 투명 버튼을 겹쳐 클릭을 가로채고 네이티브 피커를 연다. 브라우저에서는
 * DS DatePicker 그대로.
 */
export function NativeDatePicker({
  nativeMin,
  nativeMax,
  nativeIsDisabled,
  ...pickerProps
}: NativeDatePickerProps): React.ReactElement {
  // useIsNativeApp 는 native:ready 이벤트를 구독하므로, 핸드셰이크가
  // 세우는 기능 플래그도 이 재렌더 시점에는 읽을 수 있다. 플래그가 없는
  // 구버전 쉘에서는 오버레이를 그리지 않아 웹 피커가 그대로 동작한다.
  const delegate = useIsNativeApp(false) && isNativeDatePickerAvailable();

  const handleNativeOpen = async (): Promise<void> => {
    const disabled: string[] = [];
    if (nativeMin && nativeMax && nativeIsDisabled) {
      const cursor = new Date(nativeMin);
      for (let i = 0; i < MAX_DISABLED_SCAN_DAYS; i += 1) {
        if (cursor > nativeMax) {
          break;
        }
        if (nativeIsDisabled(cursor)) {
          disabled.push(toLocalDateString(cursor));
        }
        cursor.setDate(cursor.getDate() + 1);
      }
    }
    const picked = await openNativeDatePicker({
      value: pickerProps.value
        ? toLocalDateString(pickerProps.value)
        : undefined,
      min: nativeMin ? toLocalDateString(nativeMin) : undefined,
      max: nativeMax ? toLocalDateString(nativeMax) : undefined,
      disabled: disabled.length > 0 ? disabled : undefined,
    });
    if (picked) {
      const date = fromLocalDateString(picked);
      if (date) {
        pickerProps.onChange(date);
      }
    }
  };

  return (
    <div className="relative">
      <DatePicker {...pickerProps} />
      {delegate ? (
        <button
          type="button"
          aria-label="날짜 선택"
          className="absolute inset-0"
          onClick={(event) => {
            event.preventDefault();
            void handleNativeOpen();
          }}
        />
      ) : null}
    </div>
  );
}
