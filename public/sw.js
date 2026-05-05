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
    data: { url: data.url ?? '/notification' },
  };

  console.log('[SW] showNotification', title, options);
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? '/notification';

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      const existing = windowClients.find((c) => c.url === url);
      if (existing) return existing.focus();
      return clients.openWindow(url);
    })
  );
});
