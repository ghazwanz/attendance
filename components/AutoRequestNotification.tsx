"use client";

import { useEffect } from "react";

export default function AutoRequestNotification() {
  useEffect(() => {
    const timer = setTimeout(() => {
      if ("Notification" in window) {
        if (Notification.permission === "default") {
          Notification.requestPermission().then((permission) => {
            console.log("Notification permission:", permission);
          });
        }
      }
    }, 2000); // kasih delay 2 detik biar mirip Kompas

    return () => clearTimeout(timer);
  }, []);

  return null;
}
