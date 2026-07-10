import StatisticsScreen from '@feature/member/statistics/screen/StatisticsScreen';
import React from 'react';

// 인증 가드는 `src/app.module/middleware/auth.ts` 의 미들웨어가 처리한다
// (`/mypage/*` login-redirect). RSC 단순 wrapper.
export default function StatisticsPage(): React.ReactElement {
  return <StatisticsScreen />;
}
