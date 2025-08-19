"use client";

import { useEffect } from "react";
import { toast } from "react-hot-toast";

export default function LocationPermissionChecker() {
  useEffect(() => {
    // const hasShown = localStorage.getItem("locationDeniedToast");
    // if (hasShown) return; // sudah pernah ditampilkan → jangan ulangi

    async function checkLocationPermission() {
      try {
        if ("permissions" in navigator) {
          // cek via Permissions API
          const result = await navigator.permissions.query({
            name: "geolocation",
          } as PermissionDescriptor);

          if (result.state === "denied") {
            toast.error(
              "Izin lokasi diblokir. Aktifkan kembali agar sistem absensi dapat berjalan dengan baik."
            );
            localStorage.setItem("locationDeniedToast", "true");
            return;
          }
        }

        // fallback check via geolocation
        navigator.geolocation.getCurrentPosition(
          () => {
            // sukses → tidak perlu apa-apa
          },
          (err) => {
            if (err.code === err.PERMISSION_DENIED) {
              toast.error(
                "Izin lokasi tidak diberikan. Sistem absensi membutuhkan akses lokasi."
              );
              localStorage.setItem("locationDeniedToast", "true");
            }
          }
        );
      } catch (e) {
        console.error("Error checking location permission:", e);
      }
    }

    checkLocationPermission();
  }, []);

  return null; // Tidak render UI
}
