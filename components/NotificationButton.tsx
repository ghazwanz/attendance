"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/register-sw";
import { subscribeUser } from "@/lib/push-subscribe";

export default function NotificationButton() {
  useEffect(() => {
    // Registrasi Service Worker saat komponen mount
    registerServiceWorker();
  }, []);

  const handleClick = async () => {
    await subscribeUser();
    alert("✅ Notifikasi diaktifkan!");
  };

  return (
    <button
      onClick={handleClick}
      className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white"
    >
      Aktifkan Notifikasi
    </button>
  );
}
