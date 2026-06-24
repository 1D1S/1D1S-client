import { z } from 'zod';

export const NICKNAME_REGEX = /^[A-Za-z0-9가-힣]+$/;
export const NICKNAME_REQUIRED_MESSAGE = '닉네임을 입력해 주세요.';
export const NICKNAME_MAX_LENGTH = 8;
export const NICKNAME_MAX_LENGTH_MESSAGE = '닉네임은 8자 이내여야 해요.';
export const NICKNAME_PATTERN_MESSAGE =
  '닉네임은 한글·영어·숫자만 사용할 수 있고, 특수문자는 사용할 수 없어요.';

export const nicknameSchema = z
  .string()
  .trim()
  .min(1, NICKNAME_REQUIRED_MESSAGE)
  .max(NICKNAME_MAX_LENGTH, NICKNAME_MAX_LENGTH_MESSAGE)
  .regex(NICKNAME_REGEX, NICKNAME_PATTERN_MESSAGE);

/**
 * nicknameSchema 를 단일 출처로 사용해 첫 번째 오류 메시지를 반환한다.
 * 유효하면 빈 문자열. 검사 우선순위는 스키마 정의 순서(required > max > pattern).
 */
export function validateNickname(value: string): string {
  const result = nicknameSchema.safeParse(value);
  return result.success ? '' : result.error.issues[0].message;
}
