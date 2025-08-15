"use client";

import React from "react";

export default function TestNotificationButton() {
  const handleNotification = async () => {
    if (!("Notification" in window)) {
      alert("Browser ini tidak mendukung notifikasi!");
      return;
    }

    // Minta izin notifikasi jika belum
    let permission = Notification.permission;
    if (permission !== "granted") {
      permission = await Notification.requestPermission();
    }

    if (permission === "granted") {
      // Tampilkan notifikasi via service worker
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.ready;
        registration.showNotification("🎉 Notifikasi PWA Berhasil!", {
          body: "Ini contoh notifikasi dari PWA kamu.",
          icon: "/icon-192x192.png", // sesuaikan path icon
          badge: "/icon-192x192.png",
        });
      } else {
        // fallback: notifikasi biasa
        new Notification("🎉 Notifikasi PWA Berhasil!", {
          body: "Ini contoh notifikasi dari PWA kamu.",
          icon: "/icon-192x192.png",
        });
      }
    } else {
      alert("Notifikasi tidak diizinkan");
    }
  };

  return (
    <button
      onClick={handleNotification}
      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
    >
      Kirim Notifikasi
    </button>
  );
}
