import { MyPageSkeleton } from '@component/skeletons/MyPageSkeleton';
import React from 'react';

// 회원 프로필은 서버 Prefetch 가 API 응답을 기다리므로, 전역 로딩바
// 제거 후 무피드백 내비게이션이 되지 않도록 마이페이지와 동일 계열의
// 스켈레톤을 fallback 으로 보여준다.
export default function MemberProfileLoading(): React.ReactElement {
  return <MyPageSkeleton />;
}
