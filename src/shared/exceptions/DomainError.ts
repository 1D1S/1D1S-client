import { ErrorCode } from '@/shared/exceptions/ErrorCode';

/**
 * 예시입니다.
 * DomainError
 * - 도메인 레이어에서 비즈니스 규칙 위반 시 사용되는 예외 클래스입니다.
 *
 * @param code    고유 오류 코드
 * @param message human-readable 메시지
 */
export class DomainError extends Error {
  readonly code: ErrorCode;

  constructor(code: ErrorCode, message?: string) {
    super(message);
    this.name = 'DomainError';
    this.code = code;

    // V8 환경에서 stack trace 최적화
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DomainError);
    }
  }

  toJSON(): {
    name: string;
    code: ErrorCode;
    message: string;
    stack?: string | undefined;
  } {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      stack: this.stack,
    };
  }
}
