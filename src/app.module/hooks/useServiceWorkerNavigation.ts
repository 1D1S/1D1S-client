'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface NotificationNavigateMessage {
  type: 'NOTIFICATION_NAVIGATE';
  url: string;
}

function isNavigateMessage(
  data: unknown
): data is NotificationNavigateMessage {
  if (!data || typeof data !== 'object') {
    return false;
  }
  const message = data as Record<string, unknown>;
  return (
    message.type === 'NOTIFICATION_NAVIGATE' &&
    typeof message.url === 'string' &&
    message.url.length > 0
  );
}

/**
 * 서비스워커(알림 클릭)가 보낸 인앱 네비게이션 메시지를 Next 라우터로 처리한다.
 *
 * 푸시 알림 클릭 시 서비스워커가 `client.navigate()` 로 직접 이동하면 현재
 * history 항목이 "교체"돼 뒤로가기가 동작하지 않는다(특히 standalone PWA 는
 * 시작 항목 하나만 남아 완전히 갇힌다). 대신 서비스워커가 메시지를 보내고,
 * 살아 있는 클라이언트가 `router.push()` 로 이동하면 history 가 정상적으로
 * 쌓여 뒤로가기로 직전 화면(목록/홈)으로 돌아갈 수 있다.
 */
export function useServiceWorkerNavigation(): void {
  const router = useRouter();

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const onMessage = (event: MessageEvent): void => {
      if (isNavigateMessage(event.data)) {
        router.push(event.data.url);
      }
    };

    navigator.serviceWorker.addEventListener('message', onMessage);
    return () => {
      navigator.serviceWorker.removeEventListener('message', onMessage);
    };
  }, [router]);
}
