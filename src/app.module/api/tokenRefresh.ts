import { authStorage } from '@module/utils/auth';
import {
  isNativeBridgeAvailable,
  requestNativeTokenRefresh,
} from '@module/utils/nativeBridge';
import axios from 'axios';

import { API_BASE_URL } from './config';
import { isUnauthorizedError } from './error';

let inFlight: Promise<void> | null = null;

/**
 * 모든 클라이언트 측 access 토큰 갱신이 공유하는 single-flight.
 *
 * 백엔드 /auth/token 은 refresh 토큰을 회전(rotation)시키므로, 동시에 두 발이
 * 나가면 패자가 이미 소비된 refresh 토큰으로 요청해 401 을 받는다. 이 401 이
 * clearTokens() 로 이어지면 세션이 살아있는데도 로그인 힌트 쿠키가 지워져,
 * 다음 새로고침에서 미들웨어가 보호 상세를 목록으로 튕겨낸다. (기존에는
 * axios 인터셉터 · silentAuthClient · useTokenRefreshOnResume · authApi 가
 * 각자 /auth/token 을 호출해 한 페이지 로드에 2발 이상 나갔다.)
 *
 * 진행 중인 요청이 있으면 그 Promise 를 그대로 공유하고, 완료 후에만 새
 * 요청을 만든다.
 */
export function refreshAccessTokenOnce(): Promise<void> {
  if (!inFlight) {
    const nativeRefresh = requestNativeTokenRefresh();
    const refreshRequest =
      nativeRefresh ??
      axios.get(`${API_BASE_URL}/auth/token`, { withCredentials: true });
    inFlight = refreshRequest
      .then(() => {
        // 갱신 성공 = 세션 생존 확정. 일시적 401 로 지워졌을 수 있는
        // 로그인 힌트(쿠키/localStorage)를 복구한다.
        authStorage.markAuthenticated();
      })
      .finally(() => {
        inFlight = null;
      });
  }
  return inFlight;
}

/**
 * 앱 부팅 시 1회 실행하는 권위 있는 세션 확인.
 *
 * JS 힌트(localStorage/쿠키)에 의존하지 않고 httpOnly 세션 쿠키로 서버에
 * /auth/token 을 태워 세션 생존을 확정한다. Safari standalone PWA 는 콜드
 * 스타트에서 JS 힌트가 소실·지연되지만 httpOnly 쿠키는 요청에 실려 나가므로,
 * 이 경로가 로그인 상태를 힌트 없이도 복구한다. (근본 원인 대응)
 *
 * - 성공: refreshAccessTokenOnce 가 markAuthenticated() 로 authenticated 확정.
 * - 401: refresh 토큰 무효 → 게스트 확정(스테일 힌트 무시).
 * - 그 외(네트워크/타임아웃): 판정 불가 → 힌트가 있으면 낙관적 로그인, 없으면
 *   게스트. 힌트 없는 콜드 PWA 는 resume refresh 가 다음 기회에 재시도한다.
 *
 * single-flight 라 인터셉터/resume 과 동시에 불려도 요청은 1발이다.
 */
// 앱(웹뷰) resume 재시도 간격. 네이티브가 세션 쿠키를 재주입할 시간을 준다.
// 앱이 native:auth_ready 이벤트를 확정하면 이 고정 지연 대신 그 신호를 기다리는
// 방식으로 교체할 수 있다.
const NATIVE_BOOT_RETRY_MS = 700;

export function runAuthBootProbe(): Promise<void> {
  return refreshAccessTokenOnce().catch(async (error: unknown) => {
    if (authStorage.getStatus() !== 'unknown') {
      return; // 다른 경로(사이드바/에러 핸들러)가 이미 확정함
    }
    if (!isUnauthorizedError(error) && authStorage.hasTokens()) {
      authStorage.markAuthenticated();
      return;
    }
    // 앱(웹뷰): resume 시 네이티브가 세션을 재주입하는 중이라 첫 refresh 가
    // 일시 실패할 수 있다. 1회 실패로 guest 를 확정하면 로그인 세션인데도
    // login 으로 튕긴다. 짧게 한 번 더 재시도(재주입 완료 대기)한 뒤에도
    // 실패하면 그때 확정한다. 브라우저·비앱은 즉시 확정(기존 동작).
    if (isNativeBridgeAvailable()) {
      await new Promise((resolve) => setTimeout(resolve, NATIVE_BOOT_RETRY_MS));
      if (authStorage.getStatus() !== 'unknown') {
        return;
      }
      try {
        await refreshAccessTokenOnce(); // 성공 시 markAuthenticated
        return;
      } catch {
        // 재시도도 실패 → 아래에서 guest 확정
      }
      if (authStorage.getStatus() !== 'unknown') {
        return;
      }
    }
    authStorage.settleGuest();
  });
}
