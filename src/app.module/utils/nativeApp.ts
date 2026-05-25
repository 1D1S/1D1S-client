// Flutter 등 네이티브 앱 쉘이 웹뷰로 이 앱을 로드할 때 자체적으로
// 헤더/바텀바를 그리므로, 웹 측 글로벌 UI(TopNav, BottomNav, 설치/권한
// 프롬프트)는 숨겨야 한다. 네이티브 쉘은 WebView 의 user-agent 끝에
// `1D1S-App/<version>` 토큰을 붙여 자신을 식별한다.
const NATIVE_APP_UA_PATTERN = /1D1S-App/i;

export const NATIVE_APP_UA_TOKEN = '1D1S-App';

export function isNativeAppUserAgent(
  userAgent: string | null | undefined
): boolean {
  if (!userAgent) {
    return false;
  }
  return NATIVE_APP_UA_PATTERN.test(userAgent);
}
