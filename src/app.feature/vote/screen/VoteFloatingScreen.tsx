'use client';

import { useNativeCapability } from '@module/hooks/useNativeCapability';
import { isNativeVoteOwned } from '@module/utils/nativeBridge';
import type { ReactElement } from 'react';

import VoteFloatingWidget from '../components/VoteFloatingWidget';

interface VoteFloatingScreenProps {
  enabled: boolean;
  hasBottomNav: boolean;
  hasRightRail: boolean;
}

/**
 * 투표 위젯의 최상위 게이트.
 *
 * `vote_native` 쉘에서는 앱이 투표 창을 네이티브로 직접 그리고 데이터도
 * 직접 호출하므로, 위젯을 **마운트조차 하지 않는다**. 여기서 잘라야
 * 렌더뿐 아니라 today 쿼리·vote_fab/vote_card announce·탭 리스너까지 한
 * 번에 멈춘다(위젯 안쪽에서 분기하면 훅들이 계속 돈다).
 *
 * 그 외에는 기존 경로 그대로 — vote_fab 만 있는 쉘은 버튼만 앱이 그리고
 * 카드는 웹이, 브라우저·구쉘은 FAB·카드·딤 전부 웹이 그린다.
 */
export default function VoteFloatingScreen({
  enabled,
  hasBottomNav,
  hasRightRail,
}: VoteFloatingScreenProps): ReactElement | null {
  // native:ready 로 늦게 주입돼도 재평가되도록 반응형으로 읽는다.
  const nativeVoteOwned = useNativeCapability(isNativeVoteOwned);

  if (nativeVoteOwned) {
    return null;
  }

  return (
    <VoteFloatingWidget
      enabled={enabled}
      hasBottomNav={hasBottomNav}
      hasRightRail={hasRightRail}
    />
  );
}
