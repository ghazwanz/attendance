"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLocationStores, useUserLocationStores } from "../stores/useLocationStores";
import { showToast } from "./toast";

function getDistanceFromLatLonInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 🔥 Sekarang companyLocations berupa array
export function useUserLocationEffect() {
  const supabase = createClient();
  const setLocation = useUserLocationStores((state) => state.setLocation);
  const setIsOutside = useLocationStores((state) => state.setIsOutside);

  const [companyLocations, setCompanyLocations] = useState<
    { id: string; lat: number; lng: number; radius: number; name: string }[]
  >([]);

  // 🚀 Ambil semua lokasi aktif dari Supabase
  useEffect(() => {
    async function fetchCompanyLocations() {
      const { data, error } = await supabase
        .from("location_company")
        .select("*")
        .eq("status", true); // hanya ambil lokasi aktif

      if (!error && data) {
        const formatted = data.map((loc: any) => ({
          id: loc.id,
          lat: loc.latitude,
          lng: loc.longtitude,
          radius: loc.radius_meter || 1000,
          name: loc.location_name,
        }));
        setCompanyLocations(formatted);
      }
    }
    fetchCompanyLocations();
  }, [supabase]);

  // 🚀 Tracking lokasi user
  useEffect(() => {
    if (companyLocations.length === 0) return;
    if (!("geolocation" in navigator)) {
      showToast({ type: "error", message: "Browser tidak mendukung Geolocation" });
      return;
    }

    let lastLat = 0;
    let lastLng = 0;

    const handleLocation = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;

      const moved = getDistanceFromLatLonInMeters(lastLat, lastLng, latitude, longitude);
      if (moved < 5) return; // skip kalau pergeseran < 5m

      lastLat = latitude;
      lastLng = longitude;

      setLocation({ lat: latitude, lng: longitude });

      // ✅ Cek apakah user berada di dalam salah satu lokasi
      const inside = companyLocations.some((loc) => {
        const dist = getDistanceFromLatLonInMeters(latitude, longitude, loc.lat, loc.lng);
        return dist <= loc.radius;
      });

      setIsOutside(!inside);
    };

    const handleError = (err: GeolocationPositionError) => {
      if (err.code === err.PERMISSION_DENIED) {
      } else if (err.code === err.POSITION_UNAVAILABLE) {
        showToast({ type: "error", message: "Lokasi tidak tersedia" });
      } else if (err.code === err.TIMEOUT) {
        showToast({ type: "error", message: "Request lokasi timeout" });
      }
    };

    navigator.geolocation.getCurrentPosition(handleLocation, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 1000,
    });

    const watchId = navigator.geolocation.watchPosition(handleLocation, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 1000,
    });

    return () => navigator.geolocation.clearWatch(watchId);
  }, [companyLocations, setLocation, setIsOutside]);
}
