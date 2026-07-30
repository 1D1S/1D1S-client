// 알림 payload(type/targetType/targetId)로 인앱 딥링크 경로를 만든다.
// NotificationListItem.resolveTargetUrl 과 동일한 규칙을 따른다.
// 백엔드가 명시적인 `url` 을 보내면 그것을 최우선으로 사용한다.
function resolveNotificationUrl(data) {
  if (data && typeof data.url === 'string' && data.url) {
    return data.url;
  }
  if (!data) {
    return '/notification';
  }
  if (data.type === 'FRIEND_REQUEST') {
    return '/mypage/friend';
  }
  const targetType = data.targetType;
  const targetId = data.targetId;
  if (!targetType || !targetId) {
    return '/notification';
  }
  if (
    String(targetType).startsWith('MEMBER') ||
    String(targetType).startsWith('FRIEND')
  ) {
    return `/member/${targetId}`;
  }
  if (String(targetType).startsWith('DIARY')) {
    return `/diary/${targetId}`;
  }
  if (String(targetType).startsWith('CHALLENGE')) {
    return `/challenge/${targetId}`;
  }
  return '/notification';
}

// 딥링크 URL 에 notifId 쿼리를 붙여, 웹 클라이언트가 진입 시 해당 알림을
// 읽음 처리할 수 있게 한다(useMarkReadFromDeepLink). id 가 없으면 원본 URL 그대로.
function appendNotifId(url, notifId) {
  if (notifId === null || notifId === undefined) {
    return url;
  }
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}notifId=${notifId}`;
}

self.addEventListener('push', (event) => {
  console.log('[SW] push event received', event.data?.text());

  if (!event.data) {
    console.warn('[SW] push event has no data');
    return;
  }

  let data;
  try {
    data = event.data.json();
  } catch (err) {
    console.error('[SW] push data JSON parse failed:', err, event.data.text());
    return;
  }

  const title = data.title ?? '1D1S 알림';
  const options = {
    body: data.body ?? '',
    icon: '/images/logo.png',
    badge: '/images/logo.png',
    // 클릭 시 이동할 딥링크를 미리 계산해 저장한다.
    data: {
      url: resolveNotificationUrl(data),
      // 서버가 알림 id 를 실어주면 클릭 시 읽음 처리에 사용한다(없으면 null).
      notificationId:
        typeof data.notificationId === 'number'
          ? data.notificationId
          : typeof data.id === 'number'
            ? data.id
            : null,
    },
  };

  console.log('[SW] showNotification', title, options);
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const baseUrl = event.notification.data?.url ?? '/notification';
  // notifId 를 딥링크에 실어, 진입한 웹 클라이언트가 해당 알림을 읽음 처리한다.
  const url = appendNotifId(baseUrl, event.notification.data?.notificationId);

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // 이미 열린 탭이 있으면, 클라이언트가 Next 라우터로 push 하도록
        // 메시지를 보낸 뒤 포커스한다. client.navigate() 는 현재 history
        // 항목을 "교체"해 뒤로가기가 동작하지 않으므로 사용하지 않는다.
        for (const client of windowClients) {
          if ('focus' in client) {
            client.postMessage({ type: 'NOTIFICATION_NAVIGATE', url });
            return client.focus();
          }
        }
        // 열린 탭이 없으면(콜드 스타트) 딥링크로 새 창을 연다.
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
        return undefined;
      })
  );
});
