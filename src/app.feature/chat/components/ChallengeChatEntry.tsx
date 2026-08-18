'use client';

import { Text } from '@1d1s/design-system';
import { useNativeCapability } from '@module/hooks/useNativeCapability';
import { cn } from '@module/utils/cn';
import { isNativeChatAvailable } from '@module/utils/nativeBridge';
import { MessageCircle } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { useChatRoomForChallenge } from '../hooks/useChatQueries';

/**
 * 챌린지 상세에서 그 챌린지의 채팅방으로 들어간다.
 *
 * 방은 그룹 챌린지당 하나씩 서버가 자동으로 만든다 — 클라가 방을 만들거나
 * 참여시키지 않는다. 그래서 방이 아직 없으면(개인 챌린지·미참여) 아무것도
 * 그리지 않는다.
 */
export function ChallengeChatEntry({
  challengeId,
  enabled,
  className,
}: {
  challengeId: number;
  /** 참여 중인 그룹 챌린지일 때만 방 목록을 조회한다. */
  enabled: boolean;
  className?: string;
}): React.ReactElement | null {
  const nativeChat = useNativeCapability(isNativeChatAvailable);
  const roomId = useChatRoomForChallenge(challengeId, {
    enabled: enabled && !nativeChat,
  });

  if (!enabled || nativeChat || roomId == null) {
    return null;
  }

  return (
    <Link
      href={`/chat/rooms/${roomId}`}
      className={cn(
        'flex items-center justify-center gap-1.5 rounded-xl border',
        'border-gray-200 bg-white py-2.5 text-gray-700',
        'transition-colors hover:bg-gray-50',
        className
      )}
    >
      <MessageCircle className="h-4 w-4" />
      <Text size="caption1" weight="bold" className="text-inherit">
        채팅방 열기
      </Text>
    </Link>
  );
}
