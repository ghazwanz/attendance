'use client';

import { useEffect, useState } from 'react';
import {
  GoogleMap,
  Marker,
  Circle,
  useJsApiLoader,
} from '@react-google-maps/api';

// Lokasi Mahative Studio (presisi)
const mahativeStudio = {
  lat: -8.0017804,
  lng: 112.6075698,
};

const RADIUS_METER = 1000;

const containerStyle = {
  width: '100%',
  height: '440px',
  borderRadius: '1rem',
  overflow: 'hidden',
  border: '4px solid #93c5fd',
};

// Fungsi hitung jarak dua koordinat (meter)
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

export function UserLocationMap() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isOutside, setIsOutside] = useState(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation tidak didukung oleh browser ini.');
      return;
    }

    const updateLocation = (position: GeolocationPosition) => {
      const newLoc = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      const dist = getDistanceFromLatLonInMeters(
        newLoc.lat,
        newLoc.lng,
        mahativeStudio.lat,
        mahativeStudio.lng
      );

      console.log('Lokasi saat ini:', newLoc, 'Jarak:', dist, 'Akurasi:', position.coords.accuracy);

      setDistance(dist);
      setIsOutside(dist > RADIUS_METER);
      setLocation(newLoc);
    };

    navigator.geolocation.getCurrentPosition(
      updateLocation,
      (err) => {
        setError(`Gagal mengambil lokasi awal: ${err.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 1000, // <= penting untuk memberi waktu ke sistem
      }
    );

    const watchId = navigator.geolocation.watchPosition(
      updateLocation,
      (err) => {
        setError(`Gagal mendeteksi lokasi: ${err.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 1000,
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
    <div className="relative">
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
          <Marker position={location} label="🧍" />
          <Marker position={mahativeStudio} label="🏢" />

          <Circle
            center={mahativeStudio}
            radius={1000}
            options={{
              fillColor: isOutside ? '#f87171aa' : '#40A57888',
              strokeColor: isOutside ? '#ef4444' : '#006769',
              strokeWeight: 2,
              fillOpacity: 0.3,
            }}
          />
        </GoogleMap>
      </div>

      {/* Notifikasi jika diluar */}
      {isOutside && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg shadow-md z-10 animate-pulse">
          🚫 Anda berada di luar area Mahative Studio
        </div>
      )}

      {/* Optional: tampilkan jarak */}
      {distance !== null && (
        <p className="text-center text-sm mt-2 text-gray-600">
          Jarak dari Mahative Studio: <strong>{Math.round(distance)} meter</strong>
        </p>
      )}
    </div>
  );
}
