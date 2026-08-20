import { ChatRoomScreen } from '@feature/chat/screen/ChatRoomScreen';
import { notFound } from 'next/navigation';
import React from 'react';

// 푸시 딥링크가 그대로 이 경로로 온다
// (서버 ChatPushEvent data = {type: CHAT_MESSAGE, path: /chat/rooms/{id}}).
export default async function ChatRoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}): Promise<React.ReactElement> {
  const { roomId } = await params;
  const parsed = Number(roomId);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    notFound();
  }
  return <ChatRoomScreen roomId={parsed} />;
}
