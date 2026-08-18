// 네이티브 앱 배포 좌표. 스토어 링크·패키지·딥링크 규칙을 한 곳에 둔다.
//
// App Store 값은 iTunes Lookup API 로 확인한 실제 값이다
// (trackId 6793538373 / bundleId com.onedayonestreak.app / 판매자 Noh Hyunkeun).

/** Android 패키지명 = iOS 번들 ID (양쪽이 같다). */
export const APP_PACKAGE_NAME = 'com.onedayonestreak.app';

/** App Store trackId. */
export const APP_STORE_ID = '6793538373';

// hl=ko 로 한국어 스토어 페이지를 고정한다. 기기 언어가 무엇이든 국내
// 사용자가 보는 문구를 맞추기 위한 것이고, 링크 동작에는 영향이 없다.
export const PLAY_STORE_URL =
  `https://play.google.com/store/apps/details?id=${APP_PACKAGE_NAME}&hl=ko`;

export const APP_STORE_URL =
  `https://apps.apple.com/kr/app/1d1s/id${APP_STORE_ID}`;

/**
 * 앱이 딥링크로 받는 경로. 앱의 App Links intent-filter 가 이 두 갈래만
 * 선언한다(`pathPrefix=/challenge`, `/diary`) — 앱에 없는 웹 경로까지
 * 넘기면 앱이 열리기만 하고 그 화면으로는 못 간다.
 */
const DEEP_LINK_PREFIXES = ['/challenge/', '/diary/'];

/** 이 경로를 앱에서 열 수 있는가. 아니면 앱 홈으로 보낸다. */
export function isDeepLinkablePath(pathname: string): boolean {
  return DEEP_LINK_PREFIXES.some(
    (prefix) => pathname.startsWith(prefix) && /\d/.test(pathname.slice(prefix.length))
  );
}

/**
 * Android 전용 앱 열기 URL.
 *
 * `intent://` 는 **설치 여부를 브라우저가 판단해 준다** — 설치돼 있으면
 * 패키지로 바로 열고, 없으면 `browser_fallback_url`(스토어) 로 간다.
 * JS 로 설치 여부를 알아내려는 타이머 트릭이 필요 없다.
 *
 * 앱 링크 검증(assetlinks.json)이 아직 안 올라갔어도 동작한다 — 검증은
 * "브라우저를 거치지 않고 바로 앱으로" 를 위한 것이고, 여기서는 패키지를
 * 명시하기 때문이다.
 */
export function buildAndroidIntentUrl(url: URL): string {
  const path = `${url.pathname.replace(/^\//, '')}${url.search}`;
  const fallback = encodeURIComponent(PLAY_STORE_URL);
  return [
    `intent://${url.host}/${path}#Intent`,
    'scheme=https',
    `package=${APP_PACKAGE_NAME}`,
    `S.browser_fallback_url=${fallback}`,
    'end',
  ].join(';');
}
