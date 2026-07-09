import { MyPageSkeleton } from '@component/skeletons/MyPageSkeleton';
import React from 'react';

// 콜드 진입(프리페치 미적중/캐시 만료) 시 RSC 셸 전송 동안 무피드백
// 내비게이션이 되지 않도록 마이페이지와 동일 계열 스켈레톤을 fallback
// 으로 보여준다. 캐시가 warm 한 이동에서는 노출되지 않는다.
export default function MemberProfileLoading(): React.ReactElement {
  return <MyPageSkeleton />;
}
