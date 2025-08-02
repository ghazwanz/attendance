'use client';

import { useEffect, useState } from 'react';
import {
  GoogleMap,
  Marker,
  Circle,
  useJsApiLoader,
} from '@react-google-maps/api';

// ✅ Koordinat presisi Mahative Studio (dari Google Maps)
const mahativeStudio = {
  lat: -7.981029, // update jika kamu punya titik lebih akurat
  lng: 112.627612,
};

const containerStyle = {
  width: '100%',
  height: '440px',
  borderRadius: '1rem',
  overflow: 'hidden',
  border: '4px solid #93c5fd',
};

export function UserLocationMap() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation tidak didukung oleh browser ini.');
      return;
    }

    const updateLocation = (position: GeolocationPosition) => {
      if (position.coords.accuracy <= 100) {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      } else {
        console.warn('Lokasi tidak akurat, akurasi:', position.coords.accuracy);
      }
    };

    // Ambil lokasi awal
    navigator.geolocation.getCurrentPosition(
      updateLocation,
      (err) => {
        setError(`Gagal mengambil lokasi awal: ${err.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      }
    );

    // Pantau lokasi real-time
    const watchId = navigator.geolocation.watchPosition(
      updateLocation,
      (err) => {
        setError(`Gagal mendeteksi lokasi: ${err.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  if (error) {
    return <p className="text-red-500 text-center">{error}</p>;
  }

  if (!isLoaded || !location) {
    return <p className="text-center text-gray-500">📍 Mendeteksi lokasi Anda...</p>;
  }

  return (
    <div style={containerStyle} className="shadow-lg dark:border-slate-700">
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={location}
        zoom={18}
        options={{
          mapTypeId: 'roadmap',
          disableDefaultUI: true,
        }}
      >
        {/* Marker Lokasi User */}
        <Marker position={location} label="🧍" />

        {/* Marker Mahative Studio */}
        <Marker position={mahativeStudio} label="🏢" />

        {/* Lingkaran Radius Mahative Studio */}
        <Circle
          center={mahativeStudio}
          radius={30}
          options={{
            fillColor: '#40A57888',
            strokeColor: '#006769',
            strokeWeight: 2,
            fillOpacity: 0.3,
          }}
        />
      </GoogleMap>
    </div>
  );
}
