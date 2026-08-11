'use client';

import { useNativeCapability } from '@module/hooks/useNativeCapability';
import {
  isNativeVoteFabAvailable,
  onNativeVoteFabTap,
  sendNativeVoteFab,
} from '@module/utils/nativeBridge';
import { useEffect, useRef } from 'react';

interface NativeVoteFabOptions {
  /** 진행 중인 투표가 있어 버튼을 띄워야 하는지. false 면 앱 버튼을 내린다. */
  visible: boolean;
  /** 미참여 투표 수(배지용). 0 이면 앱은 배지 없이 버튼만 그린다. */
  count: number;
  /** 버튼 라벨. */
  label?: string;
  /** 네이티브 버튼 탭 콜백. 시트/패널을 여는 것은 웹 책임. */
  onTap(): void;
}

/**
 * 오늘의 투표 FAB 를 네이티브 고정 버튼으로 위임한다.
 *
 * 반환값이 true 면 앱이 버튼을 그리고 있으므로 호출부는 자기 웹 FAB 를
 * 숨긴다. 브라우저·구버전 쉘(vote_fab 피처 없음)에선 false 라 웹 FAB 가
 * 그대로 보인다 — 하위호환.
 *
 * visible/count/label 이 바뀔 때마다 재전송하고, 언마운트(라우트 이탈 포함)
 * 에서 visible:false 로 해제한다. form_cta 와 같은 수명 규칙이다.
 */
export function useNativeVoteFab({
  visible,
  count,
  label = '투표',
  onTap,
}: NativeVoteFabOptions): boolean {
  // native:ready 로 vote_fab 피처가 늦게 주입돼도 재평가되도록 반응형으로 읽는다.
  const delegated = useNativeCapability(isNativeVoteFabAvailable);

  // 핸들러는 매 렌더 바뀌지만(클로저) 구독은 한 번만 걸도록 ref 로 최신화한다.
  const tapRef = useRef(onTap);
  useEffect(() => {
    tapRef.current = onTap;
  });

  useEffect(() => {
    if (!delegated) {
      return;
    }
    sendNativeVoteFab({ visible, count, label });
  }, [delegated, visible, count, label]);

  // 해제는 언마운트에서만 — 값이 바뀔 때마다 내렸다 올리면 버튼이 깜빡인다.
  // 위젯이 홈·탐색 밖에서 언마운트되므로 이게 곧 라우트 이탈 해제다.
  useEffect(
    () => () => {
      sendNativeVoteFab({ visible: false });
    },
    []
  );

  useEffect(() => {
    if (!delegated) {
      return;
    }
    return onNativeVoteFabTap(() => tapRef.current());
  }, [delegated]);

  return delegated;
}
