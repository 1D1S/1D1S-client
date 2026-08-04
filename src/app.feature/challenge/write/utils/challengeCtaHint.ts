import { startOfToday } from 'date-fns';

import type { ChallengeCreateFormValues } from '../hooks/useChallengeCreateForm';
import type { ChallengeEditFormValues } from '../hooks/useChallengeEditForm';

// 하단 CTA 가 왜 막혔는지 안내한다. 필수 항목을 "화면 배치 순서(위→아래)" 대로
// 스캔해 처음 비어있는 항목 하나의 문구만 반환한다. 모두 충족되면 null.
// 문구·조건은 zod 스키마(challengeCreateFormSchema/challengeEditFormSchema)와
// 동일하게 맞춘다 — 힌트(null 여부)와 formState.isValid 가 어긋나지 않도록.

function isWholeNumberInRange(
  value: string | undefined,
  min: number,
  max: number
): boolean {
  if (!value || !/^\d+$/.test(value)) {
    return false;
  }
  const n = Number(value);
  return Number.isInteger(n) && n >= min && n <= max;
}

/**
 * 챌린지 생성 폼의 첫 미충족 필수 항목 안내. 섹션 배치 순서:
 * 제목 → 카테고리 → (그룹이면) 인원 → 목표 → (기간 한정이면) 기간 → 시작일 →
 * (비공개면) 비밀번호.
 */
export function getChallengeCreateCtaHint(
  v: Partial<ChallengeCreateFormValues>
): string | null {
  if (!v.title?.trim()) {
    return '챌린지 제목을 입력해주세요.';
  }
  if (v.title.length > 50) {
    return '챌린지 제목은 50자 이하로 입력해주세요.';
  }
  if (!v.category) {
    return '카테고리를 선택해주세요.';
  }
  if (v.participationType === 'GROUP') {
    if (!v.memberCount) {
      return '챌린지 인원을 선택해주세요.';
    }
    if (v.memberCount === 'etc' && !isWholeNumberInRange(v.memberCountNumber, 2, 100)) {
      return '인원을 2명부터 100명 사이로 입력해주세요.';
    }
  }
  if (
    !v.goals ||
    v.goals.length === 0 ||
    v.goals.some((goal) => !goal.value?.trim())
  ) {
    return '목표를 하나 이상 입력해주세요.';
  }
  if (v.periodType === 'LIMITED') {
    if (!v.period) {
      return '챌린지 기간을 선택해주세요.';
    }
    if (v.period === 'etc' && !isWholeNumberInRange(v.periodNumber, 7, 730)) {
      return '기간을 7일부터 730일 사이로 입력해주세요.';
    }
  }
  if (!v.startDate) {
    return '시작일을 선택해주세요.';
  }
  if (v.startDate < startOfToday()) {
    return '시작일은 오늘 이후로 선택해주세요.';
  }
  if (v.challengeType === 'PRIVATE') {
    const password = v.password?.trim() ?? '';
    if (password.length < 4 || password.length > 20) {
      return '비밀번호를 4자 이상 20자 이하로 입력해주세요.';
    }
  }
  return null;
}

/**
 * 챌린지 수정 폼의 첫 미충족 필수 항목 안내. 시작 후에는 인원·목표를 수정할 수
 * 없어 그 검사는 시작 전(그룹/고정목표)일 때만 적용한다. 기간·시작일·공개범위는
 * 수정 대상이 아니다. 배치 순서: 제목 → 카테고리 → (그룹·시작전) 인원 →
 * (고정목표·시작전) 목표.
 */
export function getChallengeEditCtaHint(
  v: Partial<ChallengeEditFormValues>
): string | null {
  if (!v.title?.trim()) {
    return '챌린지 제목을 입력해주세요.';
  }
  if (v.title.length > 50) {
    return '챌린지 제목은 50자 이하로 입력해주세요.';
  }
  if (!v.category) {
    return '카테고리를 선택해주세요.';
  }
  if (v.isGroup && !v.isStarted) {
    if (!v.memberCount) {
      return '챌린지 인원을 선택해주세요.';
    }
    if (v.memberCount === 'etc' && !isWholeNumberInRange(v.memberCountNumber, 2, 100)) {
      return '인원을 2명부터 100명 사이로 입력해주세요.';
    }
  }
  if (v.isFixedGoal && !v.isStarted) {
    if (
      !v.goals ||
      v.goals.length === 0 ||
      v.goals.some((goal) => !goal.value?.trim())
    ) {
      return '목표를 하나 이상 입력해주세요.';
    }
  }
  return null;
}
