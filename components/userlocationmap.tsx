'use client';

import { useEffect, useState } from 'react';

export function UserLocationMap() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation tidak didukung oleh browser ini.');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (err) => {
        setError(`Gagal mendeteksi lokasi: ${err.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  if (error) {
    return <p className="text-red-500 text-center">{error}</p>;
  }

  if (!location) {
    return <p className="text-center text-gray-500">📍 Mendeteksi lokasi Anda...</p>;
  }

  return (
    <div className="w-full h-[440px] rounded-xl overflow-hidden border-4 border-blue-300 dark:border-slate-700 shadow-lg">
      <iframe
        width="100%"
        height="100%"
        loading="lazy"
        allowFullScreen
        src={`https://maps.google.com/maps?q=${location.lat},${location.lng}&z=18&output=embed`}
        title="Lokasi Anda"
        className="border-0"
      />
    </div>
  );
}
