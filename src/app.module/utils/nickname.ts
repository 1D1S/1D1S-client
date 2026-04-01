import { z } from 'zod';

export const NICKNAME_REGEX = /^[A-Za-z가-힣]+$/;
export const NICKNAME_REQUIRED_MESSAGE = '닉네임을 입력해 주세요.';
export const NICKNAME_MAX_LENGTH = 8;
export const NICKNAME_MAX_LENGTH_MESSAGE = '닉네임은 8자 이내여야 해요.';
export const NICKNAME_PATTERN_MESSAGE =
  '닉네임은 한글 또는 영어만 사용할 수 있고, 특수문자는 사용할 수 없어요.';

export const nicknameSchema = z
  .string()
  .trim()
  .min(1, NICKNAME_REQUIRED_MESSAGE)
  .max(NICKNAME_MAX_LENGTH, NICKNAME_MAX_LENGTH_MESSAGE)
  .regex(NICKNAME_REGEX, NICKNAME_PATTERN_MESSAGE);

export function validateNickname(value: string): string {
  const trimmed = value.trim();

  if (!trimmed) {
    return NICKNAME_REQUIRED_MESSAGE;
  }

  if (trimmed.length > NICKNAME_MAX_LENGTH) {
    return NICKNAME_MAX_LENGTH_MESSAGE;
  }

  if (!NICKNAME_REGEX.test(trimmed)) {
    return NICKNAME_PATTERN_MESSAGE;
  }

  return '';
}
