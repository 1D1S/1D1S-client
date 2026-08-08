// RootLayout <head> 에 blocking inline script 로 주입되는 판정 코드.
// 첫 페인트 이전에 <html data-native-app> 을 확정해, 네이티브 쉘에서
// 웹 chrome(헤더/바텀바)이 한 프레임 보였다 사라지는 레이아웃 시프트를
// 없앤다. headers() 를 쓰지 않으므로 라우트는 정적 prefetch 가능 상태를
// 유지한다.
//
// 판정 신호는 `useIsNativeApp` 의 detect() 와 동일하다. 한쪽을 바꾸면
// 다른 쪽도 함께 맞춰야 한다.
//
// 세우기만 해서는 부족해서 **감시까지 한다.** SSR 은 `data-native-app="false"`
// 를 하드코딩하는데, 하이드레이션이 그 서버 값으로 <html> 속성을 되돌린다
// (suppressHydrationWarning 은 경고만 끄지 되돌리기를 막지 못한다 — 실측).
// 되돌아간 그 순간부터 useSyncExternalStore 가 클라이언트 스냅샷으로 다시
// 렌더할 때까지 웹 모바일 헤더가 네이티브 헤더 아래에 그대로 보인다 —
// 탐색 첫 진입에서 헤더가 잠깐 보였다 사라지던 것의 정체.
//
// MutationObserver 콜백은 마이크로태스크라 React 의 DOM 변경과 같은 프레임
// 안에서, **페인트 전에** 되돌린다. 그래서 뒤집힌 프레임이 화면에 나가지
// 않는다. 네이티브가 아니면 아예 설치되지 않는다.
export const NATIVE_APP_INIT_SCRIPT =
  '(function(){try{var w=window;' +
  'var n=w.__IS_NATIVE_APP__===true||' +
  "typeof w.OneDayOneStreakNative!=='undefined'||" +
  '/1D1S-App/i.test(navigator.userAgent);' +
  'if(!n)return;w.__IS_NATIVE_APP__=true;' +
  'var d=document.documentElement;' +
  "d.dataset.nativeApp='true';" +
  'new MutationObserver(function(){' +
  "if(d.dataset.nativeApp!=='true')d.dataset.nativeApp='true';" +
  "}).observe(d,{attributes:true,attributeFilter:['data-native-app']});" +
  '}catch(e){}})();';
