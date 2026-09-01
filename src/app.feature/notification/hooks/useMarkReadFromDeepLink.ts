'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { useMarkAsRead } from './useNotificationMutations';

/**
 * 알림 딥링크(`...?notifId=<id>`)로 진입하면 해당 알림을 읽음 처리한다.
 *
 * 알림 리스트에서 항목을 탭하는 경로는 NotificationListItem 이 직접
 * useMarkAsRead 를 호출해 이미 읽음 처리된다. 하지만 푸시 알림/딥링크로
 * 대상 화면(예: /challenge/123)에 바로 들어오는 경로는 리스트를 거치지
 * 않아 읽음 처리가 누락됐다. 서비스워커(sw.js)·네이티브 쉘이 딥링크에
 * `notifId` 쿼리를 실어 주면, 진입한 클라이언트가 여기서 읽음 처리한다.
 *
 * 서버가 푸시 payload 에 알림 id 를 넣어줘야 sw.js 가 notifId 를 붙인다
 * (없으면 이 훅은 no-op). useSearchParams 는 전체 트리를 CSR 로 떨구므로
 * 쓰지 않고, 네비게이션(pathname 변화)마다 location.search 를 직접 읽는다.
 */
export function useMarkReadFromDeepLink(): void {
  const pathname = usePathname();
  const { mutate: markAsRead } = useMarkAsRead();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('notifId');
    if (!raw) {
      return;
    }
    const id = Number(raw);
    if (Number.isInteger(id) && id > 0) {
      markAsRead(id);
    }
    // 새로고침/공유 시 재호출·URL 오염을 막도록 쿼리에서 제거한다.
    params.delete('notifId');
    const qs = params.toString();
    const next = window.location.pathname + (qs ? `?${qs}` : '');
    window.history.replaceState(window.history.state, '', next);
  }, [pathname, markAsRead]);
}
