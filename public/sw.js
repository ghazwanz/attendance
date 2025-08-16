self.addEventListener("install", (event) => {
  console.log('Service Worker installing.');
  self.skipWaiting(); // langsung aktif tanpa nunggu SW lama mati
});

self.addEventListener("activate", (event) => {
  console.log('Service Worker activating.');
  event.waitUntil(self.clients.claim()); // ambil kontrol semua tab
});
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'Good morning! Have a great day ahead!',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      tag: 'morning-notification',
      renotify: true,
      requireInteraction: false,
      data: {
        url: data.url || '/',
        timestamp: Date.now(),
      },
      actions: [
        {
          action: 'open',
          title: 'Open App',
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
        },
      ],
    };

    event.waitUntil(
      self.registration.showNotification(
        data.title || 'Good Morning!',
        options
      )
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }

      // Open new window if app is not open
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

self.addEventListener('notificationclose', (event) => {
  console.log('Notification was closed', event);
});