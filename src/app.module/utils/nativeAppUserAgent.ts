// 네이티브 앱 웹뷰를 User-Agent 로 식별하는 단일 소스.
//
// 서버(미들웨어 엣지)와 클라(useIsNativeApp)가 같은 마커를 쓰도록 한 곳에 둔다.
// 브라우저 API 를 쓰지 않으므로 엣지 런타임·클라이언트 양쪽에서 import 가능하다.
//
// ⚠️ 계약: 앱이 웹뷰 UA 에 이 마커를 포함시킨다(resume 세션 재주입과 함께 진행
//    중). 앱 세션이 최종 마커 문자열을 확정하면 아래 정규식만 교체하면 된다.
//    현재 값은 기존 클라 감지(useIsNativeApp)와 동일한 '1D1S-App' 로 둔다 —
//    마커가 없으면 매칭이 안 돼 기존 하드 게이트로 폴백하므로 회귀 위험이 없다.
export const NATIVE_APP_UA_PATTERN = /1D1S-App/i;

/** UA 문자열에 네이티브 앱 마커가 있는지. */
export function isNativeAppUserAgent(
  userAgent: string | null | undefined
): boolean {
  return NATIVE_APP_UA_PATTERN.test(userAgent ?? '');
}
