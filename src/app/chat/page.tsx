import { ChatRoomListScreen } from '@feature/chat/screen/ChatRoomListScreen';
import React from 'react';

// 인증 가드는 미들웨어(`src/app.module/middleware/auth.ts`)가 처리한다.
export default function ChatPage(): React.ReactElement {
  return <ChatRoomListScreen />;
}
