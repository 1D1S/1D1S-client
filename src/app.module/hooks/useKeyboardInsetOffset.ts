'use client';

import { useIsNativeApp } from '@module/hooks/useIsNativeApp';
import { useEffect, useState } from 'react';

// 모바일 소프트 키보드가 하단 고정 입력바를 가리지 않게 올릴 높이(px).
//
// 순수 모바일 웹(브라우저): 키보드가 떠도 레이아웃 뷰포트는 안 줄어들고
// visualViewport 만 줄어드니, window.innerHeight − visualViewport(height+offsetTop)
// 만큼 바를 translateY 로 올린다.
//
// 앱 웹뷰: Scaffold.resizeToAvoidBottomInset:true 로 웹뷰 자체가 줄어드는 게
// 확인됨 → 이미 줄어든 뷰포트에 fixed;bottom:0 이면 자연히 키보드 위. 여기서
// translateY 까지 올리면 이중 보정으로 gap 이 생겨(증상A) 0 을 준다.
//
// URL 바 노출/숨김 같은 작은 변화(≤80px)는 키보드로 오검출하지 않는다.
const KEYBOARD_MIN_OVERLAP_PX = 80;

export function useKeyboardInsetOffset(): number {
  // 앱(웹뷰)은 Scaffold.resizeToAvoidBottomInset:true 로 키보드만큼 웹뷰 자체를
  // 줄인다. 그러면 `fixed; bottom:0`(+safe-area) 만으로 하단 바가 자연히 키보드
  // 위에 놓인다. 여기서 translateY 까지 올리면 이중 보정으로 composer 와 키보드
  // 사이에 큰 빈 공간이 생긴다(증상A). → 앱에선 translateY 를 끄고 0 을 준다.
  // 브라우저는 레이아웃 뷰포트가 안 줄어드니 visualViewport 로 보정한다.
  const isNativeApp = useIsNativeApp(false);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) {
      return;
    }
    const update = (): void => {
      // 앱 웹뷰는 resizeToAvoidBottomInset:true 로 키보드 시 웹뷰 자체를 줄인다
      // (앱 확인 완료). 이미 줄어든 뷰포트라 fixed;bottom:0 만으로 키보드 위에
      // 붙으므로 translateY 보정을 끈다 — 안 그러면 이중 보정으로 gap(증상A).
      if (isNativeApp) {
        setOffset(0);
        return;
      }
      // 웹뷰 리사이즈가 없는 순수 모바일 웹: visualViewport 로 가려진 만큼 올린다.
      const overlap = Math.max(
        0,
        window.innerHeight - vv.height - vv.offsetTop
      );
      setOffset(overlap > KEYBOARD_MIN_OVERLAP_PX ? overlap : 0);
    };
    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, [isNativeApp]);

  return offset;
}
