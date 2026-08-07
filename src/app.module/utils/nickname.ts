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

export const WITHDRAWN_MEMBER_LABEL = '탈퇴한 사용자';

// 서버가 탈퇴 회원 닉네임을 마스킹하기 전이라 "탈퇴한 사용자_<id>_<ts>" 형태의
// raw 닉네임이 그대로 내려올 수 있다. 유효 닉네임 규칙(NICKNAME_REGEX: 공백·
// 언더바 불가)상 실제 사용자 닉네임과 절대 겹치지 않으므로 방어적으로 마스킹한다.
const WITHDRAWN_MEMBER_RAW = /^탈퇴한 사용자(?:_\d+)+$/;

/**
 * 탈퇴 회원 여부. 서버가 isDeleted 를 주면 그것을 우선하고, 아직 raw 닉네임만
 * 오는 경우 접미사 패턴/마스킹 라벨로도 판정한다(프로필 링크 비활성용).
 */
export function isWithdrawnMember(
  nickname?: string | null,
  isDeleted?: boolean
): boolean {
  if (isDeleted) {
    return true;
  }
  const value = nickname?.trim() ?? '';
  return value === WITHDRAWN_MEMBER_LABEL || WITHDRAWN_MEMBER_RAW.test(value);
}

/** 화면 표시용 닉네임 — 탈퇴 회원이면 "탈퇴한 사용자"로 마스킹한다. */
export function withdrawnDisplayName(
  nickname?: string | null,
  isDeleted?: boolean
): string {
  return isWithdrawnMember(nickname, isDeleted)
    ? WITHDRAWN_MEMBER_LABEL
    : nickname ?? '';
}

// 서버가 조합한 문장(알림 메시지 등) 안에 raw 접미사 닉네임이 섞여 오는 경우
// 문자열 내부의 해당 부분만 라벨로 치환한다.
const WITHDRAWN_MEMBER_RAW_GLOBAL = /탈퇴한 사용자(?:_\d+)+/g;

/** 문장 안에 섞인 raw 탈퇴 닉네임을 "탈퇴한 사용자"로 치환한다. */
export function maskWithdrawnInText(text: string): string {
  return text.replace(WITHDRAWN_MEMBER_RAW_GLOBAL, WITHDRAWN_MEMBER_LABEL);
}
