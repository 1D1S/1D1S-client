// 네이티브 앱 웹뷰를 User-Agent 로 식별하는 단일 소스.
//
// 서버(미들웨어 엣지)와 클라(useIsNativeApp)가 같은 마커를 쓰도록 한 곳에 둔다.
// 브라우저 API 를 쓰지 않으므로 엣지 런타임·클라이언트 양쪽에서 import 가능하다.
//
// 계약(앱 빌드 134): 모든 웹뷰 UA 끝에 `1D1S-App/<버전>`(예: `1D1S-App/1.0.0`)
// 를 붙인다. 버전이 올라도(1.1.0 등) 감지되도록 **접두사 `1D1S-App/`** 로
// 매칭한다. 마커가 없으면 매칭 안 돼 기존 하드 게이트로 폴백(회귀 없음).
export const NATIVE_APP_UA_PATTERN = /1D1S-App\//i;

/** UA 문자열에 네이티브 앱 마커가 있는지. */
export function isNativeAppUserAgent(
  userAgent: string | null | undefined
): boolean {
  return NATIVE_APP_UA_PATTERN.test(userAgent ?? '');
}
