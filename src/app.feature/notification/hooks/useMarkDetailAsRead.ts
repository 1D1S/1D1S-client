'use client';

import { useIsLoggedIn } from '@feature/member/hooks/useIsLoggedIn';
import { useEffect, useRef } from 'react';

import type { NotificationReadTargetType } from '../type/notification';
import { useMarkTargetAsRead } from './useNotificationMutations';

/**
 * 상세 화면 진입 시 그 엔티티에 걸린 알림을 읽음 처리한다.
 *
 * 리스트·딥링크·알림·푸시 등 **어떤 경로로 들어오든** 트리거되도록 상세
 * 화면의 진입 지점(훅)에 둔다. 알림 목록에서 항목을 눌러 들어오는 경로만
 * 처리하면 푸시·딥링크 진입에서 뱃지가 안 줄어든다.
 *
 * - 마운트 1회 + targetId 변경 시 1회. 리렌더로는 재호출하지 않는다.
 * - 비로그인/확인 중(authStatus !== 'authenticated')이면 호출하지 않는다.
 *   로그인이 부팅 프로브로 늦게 확정돼도 값이 바뀌면 그때 한 번 발화한다.
 * - 실패는 무시한다(useMarkTargetAsRead 가 전역 토스트도 끈다).
 *
 * 데이터 페칭이 아니라 진입 시점의 side effect 라 useMutation + effect 조합을
 * 쓴다(아키텍처 불변량의 "useEffect 로 페칭 금지" 는 useQuery 계열 이야기).
 */
export function useMarkDetailAsRead(
  targetType: NotificationReadTargetType,
  targetId: number,
  enabled = true
): void {
  const isLoggedIn = useIsLoggedIn();
  const { mutate } = useMarkTargetAsRead();
  // 이미 처리한 대상. 같은 상세에서 리렌더가 나도 다시 쏘지 않는다.
  const markedRef = useRef<string | null>(null);

  const shouldMark =
    enabled && isLoggedIn && Number.isFinite(targetId) && targetId > 0;
  const target = `${targetType}:${targetId}`;

  useEffect(() => {
    if (!shouldMark || markedRef.current === target) {
      return;
    }
    markedRef.current = target;
    mutate({ targetType, targetId });
  }, [shouldMark, target, targetType, targetId, mutate]);
}
