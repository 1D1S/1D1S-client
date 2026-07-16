// RootLayout <head> 에 blocking inline script 로 주입되는 판정 코드.
// 첫 페인트 이전에 <html data-native-app> 을 확정해, 네이티브 쉘에서
// 웹 chrome(헤더/바텀바)이 한 프레임 보였다 사라지는 레이아웃 시프트를
// 없앤다. headers() 를 쓰지 않으므로 라우트는 정적 prefetch 가능 상태를
// 유지한다.
//
// 판정 신호는 `useIsNativeApp` 의 detect() 와 동일하다. 한쪽을 바꾸면
// 다른 쪽도 함께 맞춰야 한다.
export const NATIVE_APP_INIT_SCRIPT =
  '(function(){try{var w=window;' +
  'var n=w.__IS_NATIVE_APP__===true||' +
  "typeof w.OneDayOneStreakNative!=='undefined'||" +
  '/1D1S-App/i.test(navigator.userAgent);' +
  'if(n){w.__IS_NATIVE_APP__=true;' +
  "document.documentElement.dataset.nativeApp='true';}}catch(e){}})();";
