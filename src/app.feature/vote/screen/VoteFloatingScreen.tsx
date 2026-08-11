'use client';

import { useNativeCapability } from '@module/hooks/useNativeCapability';
import { isNativeVoteSheetAvailable } from '@module/utils/nativeBridge';
import type { ReactElement } from 'react';

import VoteFloatingWidget from '../components/VoteFloatingWidget';

interface VoteFloatingScreenProps {
  enabled: boolean;
  hasBottomNav: boolean;
  hasRightRail: boolean;
}

export default function VoteFloatingScreen({
  enabled,
  hasBottomNav,
  hasRightRail,
}: VoteFloatingScreenProps): ReactElement {
  // 3단 분기의 최상위: vote_sheet 쉘이면 앱이 FAB·시트를 통째로 그리므로
  // 웹은 아무것도 렌더하지 않는다(웹 FAB·플로팅 패널 모두 숨김).
  // native:ready 로 늦게 주입돼도 재평가되도록 반응형으로 읽는다.
  const nativeSheet = useNativeCapability(isNativeVoteSheetAvailable);

  return (
    <VoteFloatingWidget
      enabled={enabled}
      hasBottomNav={hasBottomNav}
      hasRightRail={hasRightRail}
      nativeSheet={nativeSheet}
    />
  );
}
