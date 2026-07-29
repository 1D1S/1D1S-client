'use client';

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
      setOffset(overlap > KEYBOARD_MIN_OVERLAP_PX ? overlap : 0);
    };
    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, []);

  return offset;
}
