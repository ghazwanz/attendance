self.addEventListener("install", (event) => {
  console.log("📦 Service Worker Installed");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("🚀 Service Worker Activated");
});

self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "Notifikasi";
  const options = {
    body: data.body || "Ada pesan baru",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
