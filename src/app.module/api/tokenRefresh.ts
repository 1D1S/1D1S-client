import { authStorage } from '@module/utils/auth';
import { waitForNativeAuthReady } from '@module/utils/nativeAuthReady';
import {
  isNativeBridgeAvailable,
  NativeTokenRefreshError,
  requestNativeTokenRefresh,
} from '@module/utils/nativeBridge';
import axios from 'axios';

import { API_BASE_URL } from './config';
import { isUnauthorizedError } from './error';

let inFlight: Promise<void> | null = null;

function refreshViaWebCookie(): Promise<void> {
  return axios
    .get(`${API_BASE_URL}/auth/token`, { withCredentials: true })
    .then(() => undefined);
}

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
    // 앱(웹뷰)에서는 네이티브 셸이 갱신을 대행하지만, 네이티브가 못 해주는
    // 경우(네이티브 세션이 죽었거나 응답 없음)에도 웹 httpOnly 쿠키 세션은
    // 멀쩡할 수 있다. 예전엔 여기서 그대로 실패해 — 네이티브 세션이 한 번
    // 죽으면 그 앱 실행 내내 웹이 제 쿠키로 갱신할 방법이 없어, 살아 있는
    // 세션이 로그아웃으로 확정됐다. 네이티브 실패 시 웹 자체 /auth/token
    // 으로 한 번 더 시도한다.
    const refreshRequest = nativeRefresh
      ? nativeRefresh.catch((error: unknown) => {
          if (error instanceof NativeTokenRefreshError) {
            return refreshViaWebCookie();
          }
          throw error;
        })
      : refreshViaWebCookie();
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
// 앱(웹뷰) resume 시 세션 재주입 완료를 기다리는 최대 유예(계약: 1.5초).
// native:auth_ready 가 그 전에 오면 즉시 진행한다.
const NATIVE_AUTH_READY_TIMEOUT_MS = 1_500;

export function runAuthBootProbe(): Promise<void> {
  return refreshAccessTokenOnce().catch(async (error: unknown) => {
    if (authStorage.getStatus() !== 'unknown') {
      return; // 다른 경로(사이드바/에러 핸들러)가 이미 확정함
    }
    if (!isUnauthorizedError(error) && authStorage.hasTokens()) {
      authStorage.markAuthenticated();
      return;
    }
    // 앱(웹뷰): resume 시 네이티브가 세션 쿠키를 재주입하는 중이라 첫 refresh 가
    // 일시 실패할 수 있다. 1회 실패로 guest 를 확정하면 로그인 세션인데도 login
    // 으로 튕긴다. 재주입 완료 신호(native:auth_ready, 이미 준비면 즉시)나 짧은
    // 유예까지 기다린 뒤 다시 refresh, 그래도 실패하면 그때 확정한다. 브라우저·
    // 비앱은 즉시 확정(기존 동작).
    if (isNativeBridgeAvailable()) {
      await waitForNativeAuthReady(NATIVE_AUTH_READY_TIMEOUT_MS);
      if (authStorage.getStatus() !== 'unknown') {
        return;
      }
      try {
        await refreshAccessTokenOnce(); // 성공 시 markAuthenticated
        return;
      } catch {
        // 재시도 실패 — 아래 지연 2차 재시도로.
      }
      if (authStorage.getStatus() !== 'unknown') {
        return;
      }
      // 지연 2차 재시도: 딥링크/콜드 진입으로 뜬 **상세 웹뷰**는 앱이
      // native:auth_ready 를 쏘는 대상(탭 웹뷰)이 아니라 신호가 영영 안
      // 온다. 그 사이 앱의 쿠키 심기(부트스트랩, 수 초)가 끝났을 수
      // 있으니 한 번 더 기다렸다 재시도한 뒤에야 guest 를 확정한다.
      // 진짜 게스트는 이 ~4초 동안 스켈레톤을 본다 — 로그인 사용자가
      // '로그인 필요'로 굳는 것보다 싼 비용이다.
      await new Promise((resolve) => setTimeout(resolve, 2_500));
      if (authStorage.getStatus() !== 'unknown') {
        return;
      }
      try {
        await refreshAccessTokenOnce();
        return;
      } catch {
        // 2차도 실패 → 아래에서 guest 확정
      }
      if (authStorage.getStatus() !== 'unknown') {
        return;
      }
    }
    authStorage.settleGuest();
  });
}
