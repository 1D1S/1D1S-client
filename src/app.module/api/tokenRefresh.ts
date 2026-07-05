import { authStorage } from '@module/utils/auth';
import axios from 'axios';

import { API_BASE_URL } from './config';

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
    inFlight = axios
      .get(`${API_BASE_URL}/auth/token`, { withCredentials: true })
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
