import { describe, expect, it } from 'vitest';

import { isAuthPrincipalError, isInvalidRefreshTokenError } from './error';

const axiosErrorWithCode = (code: string): unknown => ({
  isAxiosError: true,
  response: { status: 401, data: { code } },
});

// AUTH-001/AUTH-002 는 서버가 400 으로 내려주므로 상태 코드를 400 으로 둔다.
const axiosBadRequestWithCode = (code: string): unknown => ({
  isAxiosError: true,
  response: { status: 400, data: { code } },
});

describe('isInvalidRefreshTokenError', () => {
  // 서버가 쿠키를 만료시키지 않는 재사용 감지(AUTH-012)도 복구 불가로 보고
  // /auth/logout 정리를 트리거해야 한다.
  it.each(['AUTH-006', 'AUTH-012'])('treats %s as unrecoverable', (code) => {
    expect(isInvalidRefreshTokenError(axiosErrorWithCode(code))).toBe(true);
  });

  it('ignores recoverable/other codes', () => {
    expect(isInvalidRefreshTokenError(axiosErrorWithCode('AUTH-007'))).toBe(
      false
    );
    expect(isInvalidRefreshTokenError(new Error('boom'))).toBe(false);
  });
});

describe('isAuthPrincipalError', () => {
  // 익명/무효 principal 로 인증 필수 API 를 호출한 400 응답. 세션 힌트가 stale 한
  // 상태이므로 토스트 대신 조용히 세션을 정리해야 한다.
  it.each(['AUTH-001', 'AUTH-002'])('treats %s as principal error', (code) => {
    expect(isAuthPrincipalError(axiosBadRequestWithCode(code))).toBe(true);
  });

  it('ignores other codes and non-axios errors', () => {
    expect(isAuthPrincipalError(axiosBadRequestWithCode('AUTH-006'))).toBe(
      false
    );
    expect(isAuthPrincipalError(new Error('boom'))).toBe(false);
  });
});
