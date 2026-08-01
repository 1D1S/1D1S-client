'use client';

import { useIsNativeApp } from '@module/hooks/useIsNativeApp';
import { useEffect, useState } from 'react';

// 모바일 소프트 키보드가 가리는 높이(px)를 visualViewport 로 추적한다.
//
// iOS WKWebView(앱 웹뷰)는 키보드가 뜰 때 네이티브 웹뷰를 줄여도 웹의 "레이아웃
// 뷰포트"(=position:fixed·100vh 기준)는 그대로 두고 "비주얼 뷰포트"만 줄이는
// 경우가 있다. 그러면 `fixed; bottom:0` 인 하단 입력바가 키보드 아래(가려짐)에
// 남는다. window.innerHeight − visualViewport(height+offsetTop) 로 가려진 높이를
// 구해, 그 값만큼 하단 바를 위로 올린다. 레이아웃 뷰포트가 이미 같이 줄어드는
// 브라우저에선 이 값이 ~0 이라 이중 보정이 없다.
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
      const overlap = Math.max(
        0,
        window.innerHeight - vv.height - vv.offsetTop
      );
      // TEMP(빌드 확인용): 앱 웹뷰에서 innerHeight 가 리사이즈를 반영하는지
      // (=이중 보정 여부) 판단용 로그. 확정되면 제거한다.
      if (isNativeApp) {
        console.log('[kbd-inset]', {
          innerHeight: window.innerHeight,
          vvHeight: Math.round(vv.height),
          vvOffsetTop: Math.round(vv.offsetTop),
          overlap: Math.round(overlap),
        });
      }
      if (isNativeApp) {
        setOffset(0);
        return;
      }
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
