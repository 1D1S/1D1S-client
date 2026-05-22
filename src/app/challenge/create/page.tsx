import ChallengeCreateScreen from '@feature/challenge/write/screen/ChallengeCreateScreen';
import React from 'react';

// 인증 가드는 `src/app.module/middleware/auth.ts` 의 미들웨어가 처리한다.
// 토큰 쿠키가 없으면 미들웨어가 /login 으로 서버 단계에서 리다이렉트하므로
// 클라이언트 useEffect 가드를 제거하고 RSC 단순 wrapper 로만 둔다.
export default function ChallengeCreatePage(): React.ReactElement {
  return <ChallengeCreateScreen />;
}
