import { describe, expect, it } from 'vitest';

import { isInvalidRefreshTokenError } from './error';

const axiosErrorWithCode = (code: string): unknown => ({
  isAxiosError: true,
  response: { status: 401, data: { code } },
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
