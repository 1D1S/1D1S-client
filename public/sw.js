self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const title = data.title ?? '1D1S 알림';
  const options = {
    body: data.body ?? '',
    icon: '/images/icon-192x192.png',
    badge: '/images/icon-192x192.png',
    data: { url: data.url ?? '/notification' },
  };

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
