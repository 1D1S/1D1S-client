import { NotificationScreen } from '@feature/notification/screen/NotificationScreen';
import React from 'react';

// 인증 가드는 미들웨어(`src/app.module/middleware/auth.ts`)가 처리.
// 토큰 쿠키가 없으면 서버 단계에서 /login 으로 리다이렉트되므로 클라이언트
// useEffect 가드를 제거한다.
export default function NotificationPage(): React.ReactElement {
  return <NotificationScreen />;
}
