import { addDays, startOfToday } from 'date-fns';
import { describe, expect, it } from 'vitest';

import {
  getChallengeCreateCtaHint,
  getChallengeEditCtaHint,
} from './challengeCtaHint';

const tomorrow = addDays(startOfToday(), 1);

// 개별참여·무기한·공개의 최소 유효 생성 값(필수 모두 충족).
const validCreate = {
  title: '매일 30분 책 읽기',
  category: 'BOOK' as const,
  participationType: 'INDIVIDUAL' as const,
  periodType: 'ENDLESS' as const,
  challengeType: 'PUBLIC' as const,
  startDate: tomorrow,
  goals: [{ value: '30분 독서' }],
};

describe('getChallengeCreateCtaHint — 배치 순서대로 첫 미충족만', () => {
  it('모두 충족되면 null', () => {
    expect(getChallengeCreateCtaHint(validCreate)).toBeNull();
  });

  it('제목·카테고리 미입력 → 제목 문구(첫 번째)', () => {
    expect(
      getChallengeCreateCtaHint({
        ...validCreate,
        title: '',
        category: undefined,
      })
    ).toBe('챌린지 제목을 입력해주세요.');
  });

  it('제목은 됐고 카테고리·시작일 미입력 → 카테고리 문구', () => {
    expect(
      getChallengeCreateCtaHint({
        ...validCreate,
        category: undefined,
        startDate: undefined,
      })
    ).toBe('카테고리를 선택해주세요.');
  });

  it('제목·카테고리 됐고 목표 없음 → 목표 문구', () => {
    expect(
      getChallengeCreateCtaHint({ ...validCreate, goals: [] })
    ).toBe('목표를 하나 이상 입력해주세요.');
  });

  it('그룹인데 인원 미선택 → 목표보다 먼저 인원 문구', () => {
    expect(
      getChallengeCreateCtaHint({
        ...validCreate,
        participationType: 'GROUP',
        memberCount: undefined,
        goals: [],
      })
    ).toBe('챌린지 인원을 선택해주세요.');
  });

  it('기간 한정인데 기간 미선택 → 기간 문구', () => {
    expect(
      getChallengeCreateCtaHint({
        ...validCreate,
        periodType: 'LIMITED',
        period: undefined,
      })
    ).toBe('챌린지 기간을 선택해주세요.');
  });

  it('비공개인데 비밀번호 미달 → 비밀번호 문구(마지막)', () => {
    expect(
      getChallengeCreateCtaHint({
        ...validCreate,
        challengeType: 'PRIVATE',
        password: '12',
      })
    ).toBe('비밀번호를 4자 이상 20자 이하로 입력해주세요.');
  });
});

describe('getChallengeEditCtaHint — 시작 후엔 인원·목표 검사 생략', () => {
  const validEdit = {
    title: '수정된 제목',
    category: 'DEV' as const,
    isGroup: true,
    isFixedGoal: true,
    isStarted: false,
    memberCount: '5' as const,
    goals: [{ value: '목표' }],
  };

  it('모두 충족되면 null', () => {
    expect(getChallengeEditCtaHint(validEdit)).toBeNull();
  });

  it('제목 비우면 제목 문구', () => {
    expect(getChallengeEditCtaHint({ ...validEdit, title: '' })).toBe(
      '챌린지 제목을 입력해주세요.'
    );
  });

  it('시작 전 그룹·인원 미선택 → 인원 문구', () => {
    expect(
      getChallengeEditCtaHint({ ...validEdit, memberCount: undefined })
    ).toBeTruthy();
  });

  it('이미 시작됐으면 인원·목표 비어도 null(수정 불가 항목)', () => {
    expect(
      getChallengeEditCtaHint({
        ...validEdit,
        isStarted: true,
        memberCount: undefined,
        goals: [],
      })
    ).toBeNull();
  });
});
