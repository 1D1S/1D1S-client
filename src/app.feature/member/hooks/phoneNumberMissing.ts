import type { AuthStatus } from '@module/utils/auth';

import type { MyPageData } from '../type/member';

/**
 * 전화번호 미입력 여부(순수 판정). 훅에서 분리해 API 클라이언트 의존 없이
 * 단위 테스트가 가능하다.
 * - `authenticated` 로 확정되고
 * - my-page 응답이 도착했으며(`data` 존재)
 * - 응답에 phoneNumber 가 없을 때만 true.
 *
 * unknown/guest 이거나 아직 로딩 중(`data` 미도착)이면 false 를 돌려,
 * 인증 확정 전 배지·배너가 번쩍이는 것을 막는다.
 */
export function isPhoneNumberMissing(
  status: AuthStatus,
  data: Pick<MyPageData, 'phoneNumber'> | undefined
): boolean {
  return status === 'authenticated' && Boolean(data) && !data?.phoneNumber;
}
