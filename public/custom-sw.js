// public/custom-sw.js

self.addEventListener("install", (event) => {
  self.skipWaiting(); // langsung aktif tanpa nunggu SW lama mati
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim()); // ambil kontrol semua tab
});

// nanti di sini juga bisa tambahkan listener push notification
self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification(data.title || "Notifikasi", {
      body: data.body || "Ada update baru nih!",
      icon: "/icons/icon-192x192.png",
    })
  );
});
