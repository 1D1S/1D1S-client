import { AxiosError } from 'axios';
import { authStorage } from '@module/utils/auth';

/**
 * 401 에러 처리 핸들러
 * - 토큰 클리어
 * - 알림 표시
 * - 로그인 페이지로 리다이렉트
 */
export function handleAuthError(error: unknown): void {
  // 브라우저 환경에서만 실행
  if (typeof window === 'undefined') {
    return;
  }

  const isAxiosError = error instanceof AxiosError;
  const status = isAxiosError ? error.response?.status : null;

  if (status !== 401) {
    return;
  }

  // 토큰 클리어
  authStorage.clearTokens();

  // 에러 메시지 추출
  const responseData = isAxiosError ? error.response?.data : null;
  const message =
    responseData && typeof responseData === 'object' && 'message' in responseData
      ? String(responseData.message)
      : '로그인이 필요하거나 세션이 만료되었습니다.';

  // 알림 표시
  alert(message);

  // 로그인 페이지로 리다이렉트
  window.location.href = '/auth/login';
}

/**
 * 에러가 401인지 확인
 */
export function isUnauthorizedError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return error.response?.status === 401;
  }
  return false;
}
