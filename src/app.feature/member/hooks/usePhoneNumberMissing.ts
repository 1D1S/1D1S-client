'use client';

import { useAuthStatus } from '@module/hooks/useAuthStatus';

import { isPhoneNumberMissing } from './phoneNumberMissing';
import { useMyPage } from './useMemberQueries';

/**
 * 로그인 사용자의 전화번호 미입력 여부.
 * 데이터 소스는 기존 my-page 쿼리(`useMyPage`)를 재사용한다 — 사이드바
 * 응답에는 phoneNumber 가 없기 때문. 동일 queryKey 로 dedupe/캐시된다.
 */
export function usePhoneNumberMissing(): boolean {
  const status = useAuthStatus();
  const { data } = useMyPage();
  return isPhoneNumberMissing(status, data);
}
