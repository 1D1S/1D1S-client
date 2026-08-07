import { describe, expect, it } from 'vitest';

import {
  isWithdrawnMember,
  maskWithdrawnInText,
  WITHDRAWN_MEMBER_LABEL,
  withdrawnDisplayName,
} from './nickname';

describe('isWithdrawnMember', () => {
  it('isDeleted 플래그면 무조건 탈퇴', () => {
    expect(isWithdrawnMember('홍길동', true)).toBe(true);
  });

  it('raw 접미사 닉네임을 탈퇴로 판정', () => {
    expect(isWithdrawnMember('탈퇴한 사용자_16_1785660134862')).toBe(true);
    expect(isWithdrawnMember('탈퇴한 사용자_16')).toBe(true);
  });

  it('서버 마스킹 라벨도 탈퇴로 판정', () => {
    expect(isWithdrawnMember('탈퇴한 사용자')).toBe(true);
  });

  it('일반 닉네임은 탈퇴 아님', () => {
    expect(isWithdrawnMember('탈퇴한사용자')).toBe(false);
    expect(isWithdrawnMember('홍길동')).toBe(false);
    expect(isWithdrawnMember(null)).toBe(false);
    expect(isWithdrawnMember(undefined)).toBe(false);
  });
});

describe('withdrawnDisplayName', () => {
  it('탈퇴 회원은 마스킹 라벨로 치환', () => {
    expect(withdrawnDisplayName('탈퇴한 사용자_16_1785660134862')).toBe(
      WITHDRAWN_MEMBER_LABEL
    );
    expect(withdrawnDisplayName('아무개', true)).toBe(WITHDRAWN_MEMBER_LABEL);
  });

  it('일반 닉네임은 그대로', () => {
    expect(withdrawnDisplayName('홍길동')).toBe('홍길동');
  });
});

describe('maskWithdrawnInText', () => {
  it('문장 안 raw 닉네임만 라벨로 치환', () => {
    expect(
      maskWithdrawnInText('탈퇴한 사용자_16_1785660134862님이 좋아요를 눌렀어요')
    ).toBe('탈퇴한 사용자님이 좋아요를 눌렀어요');
  });

  it('일반 문장은 그대로', () => {
    expect(maskWithdrawnInText('홍길동님이 댓글을 남겼어요')).toBe(
      '홍길동님이 댓글을 남겼어요'
    );
  });
});
