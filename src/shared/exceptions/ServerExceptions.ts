// src/exceptions/ServerExceptions.ts
import { BaseException } from '@/shared/base/BaseException';

/**
 * 400 Bad Request
 */
export class BadRequestException extends BaseException {
  constructor(msgForDev: string = 'Bad request.', msgForUser: string = '잘못된 요청입니다.') {
    super(msgForDev, msgForUser);
  }
}

/**
 * 401 Unauthorized
 */
export class UnauthorizedException extends BaseException {
  constructor(
    msgForDev: string = 'Unauthorized access.',
    msgForUser: string = '인증이 필요합니다.'
  ) {
    super(msgForDev, msgForUser);
  }
}

/**
 * 403 Forbidden
 */
export class ForbiddenException extends BaseException {
  constructor(msgForDev: string = 'Forbidden.', msgForUser: string = '권한이 없습니다.') {
    super(msgForDev, msgForUser);
  }
}

/**
 * 404 Not Found
 */
export class NotFoundException extends BaseException {
  constructor(
    msgForDev: string = 'Resource not found.',
    msgForUser: string = '요청하신 자원을 찾을 수 없습니다.'
  ) {
    super(msgForDev, msgForUser);
  }
}

/**
 * 408 Request Timeout
 */
export class TimeoutException extends BaseException {
  constructor(
    msgForDev: string = 'Request timeout.',
    msgForUser: string = '요청 시간이 초과되었습니다.'
  ) {
    super(msgForDev, msgForUser);
  }
}

/**
 * 500 Internal Server Error
 */
export class InternalServerErrorException extends BaseException {
  constructor(
    msgForDev: string = 'Internal server error.',
    msgForUser: string = '서버 오류가 발생했습니다. 관리자에게 문의하세요.'
  ) {
    super(msgForDev, msgForUser);
  }
}

/**
 * 503 Service Unavailable
 */
export class ServiceUnavailableException extends BaseException {
  constructor(
    msgForDev: string = 'Service unavailable.',
    msgForUser: string = '현재 서비스를 이용할 수 없습니다. 잠시 후 다시 시도해주세요.'
  ) {
    super(msgForDev, msgForUser);
  }
}

/**
 * GraphQL 처리 오류
 */
export class GraphqlException extends BaseException {
  constructor(
    msgForDev: string = 'GraphQL error.',
    msgForUser: string = '데이터 처리 중 오류가 발생했습니다.'
  ) {
    super(msgForDev, msgForUser);
  }
}

/**
 * Rest 처리 오류
 */
export class RestException extends BaseException {
  constructor(
    msgForDev: string = 'GraphQL error.',
    msgForUser: string = '데이터 처리 중 오류가 발생했습니다.'
  ) {
    super(msgForDev, msgForUser);
  }
}

/**
 * Parsing Exception
 */
export class ParsingException extends BaseException {
  constructor(
    msgForDev: string = 'Parsing error.',
    msgForUser: string = '데이터 파싱 중 오류가 발생했습니다.'
  ) {
    super(msgForDev, msgForUser);
  }
}

/**
 * 네트워크 오류
 */
export class NetworkException extends BaseException {
  constructor(
    msgForDev: string = 'Network error.',
    msgForUser: string = '네트워크 오류가 발생했습니다. 인터넷 연결을 확인하세요.'
  ) {
    super(msgForDev, msgForUser);
  }
}
