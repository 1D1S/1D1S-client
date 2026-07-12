import { z } from 'zod';

// 서버와 동일한 검증 규칙. 하이픈 유무는 무관하다.
export const PHONE_NUMBER_REGEX = /^01[016-9]-?\d{3,4}-?\d{4}$/;
export const PHONE_NUMBER_REQUIRED_MESSAGE = '전화번호를 입력해 주세요.';
export const PHONE_NUMBER_PATTERN_MESSAGE = '올바른 전화번호 형식이 아니에요.';
// 서버 409(USER-010) 응답과 동일한 문구.
export const PHONE_NUMBER_DUPLICATE_MESSAGE =
  '이미 등록된 휴대폰 번호입니다.';

export const phoneNumberSchema = z
  .string()
  .trim()
  .min(1, PHONE_NUMBER_REQUIRED_MESSAGE)
  .regex(PHONE_NUMBER_REGEX, PHONE_NUMBER_PATTERN_MESSAGE);

/**
 * phoneNumberSchema 를 단일 출처로 사용해 첫 번째 오류 메시지를 반환한다.
 * 유효하면 빈 문자열.
 */
export function validatePhoneNumber(value: string): string {
  const result = phoneNumberSchema.safeParse(value);
  return result.success ? '' : result.error.issues[0].message;
}

/** 하이픈 등 숫자 외 문자를 제거한 순수 숫자 문자열(API 전송용). */
export function normalizePhoneNumber(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * 입력 편의를 위한 자동 하이픈 포맷팅. 숫자만 남긴 뒤 최대 11자리로 자르고
 * 010-1234-5678(11자리) / 010-123-4567(10자리) 형태로 구분자를 넣는다.
 */
export function formatPhoneNumber(value: string): string {
  const digits = normalizePhoneNumber(value).slice(0, 11);
  if (digits.length < 4) {
    return digits;
  }
  if (digits.length < 8) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  // 8~10자리: 3-중간-4 로 구분.
  const head = digits.slice(0, 3);
  const tail = digits.slice(-4);
  const mid = digits.slice(3, -4);
  return `${head}-${mid}-${tail}`;
}
