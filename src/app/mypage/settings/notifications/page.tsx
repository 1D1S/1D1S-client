import { NotificationSettingsScreen } from '@feature/notification/screen/NotificationSettingsScreen';
import React from 'react';

// 인증 가드는 미들웨어(`/mypage(\/.*)?$` 보호 라우트)가 처리.
// 클라이언트 useEffect 가드를 제거하고 RSC 단순 wrapper 로만 둔다.
export default function NotificationSettingsPage(): React.ReactElement {
  return <NotificationSettingsScreen />;
}
