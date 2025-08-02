'use client';

import { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  Popup,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const mahativeStudio = {
  lat: -8.0017804,
  lng: 112.6075698,
};

const RADIUS_METER = 1000;

const iconUser = new L.Icon({
  iconUrl: '/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

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

function SetMapView({ location }: { location: { lat: number; lng: number } }) {
  const map = useMap();
  useEffect(() => {
    map.setView([location.lat, location.lng], 18);
  }, [location, map]);
  return null;
}

function UserLocationMap() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isOutside, setIsOutside] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation tidak didukung oleh browser ini.');
      return;
    }

    const handleLocation = (position: GeolocationPosition) => {
      const userLoc = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      setLocation(userLoc);

      const dist = getDistanceFromLatLonInMeters(
        userLoc.lat,
        userLoc.lng,
        mahativeStudio.lat,
        mahativeStudio.lng
      );
      setDistance(dist);
      setIsOutside(dist > RADIUS_METER);
    };

    // Deteksi lokasi awal
    navigator.geolocation.getCurrentPosition(handleLocation, (err) => {
      setError(`Gagal mendeteksi lokasi: ${err.message}`);
    }, {
      enableHighAccuracy: true,
    });

    // Pantau lokasi terus-menerus
    const watchId = navigator.geolocation.watchPosition(handleLocation, (err) => {
      setError(`Gagal memantau lokasi: ${err.message}`);
    }, {
      enableHighAccuracy: true,
      timeout: 30000,
      maximumAge: 1000,
    });

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  if (error) {
    return <p className="text-red-500 text-center">{error}</p>;
  }

  if (!location) {
    return <p className="text-center text-gray-500">📍 Mendeteksi lokasi Anda...</p>;
  }

  return (
    <div className="relative h-[440px] w-full rounded-xl overflow-hidden border-4 border-blue-200 dark:border-slate-700 shadow-lg">
      <MapContainer
        center={[location.lat, location.lng]}
        zoom={18}
        style={{ height: '100%', width: '100%' }}
      >
        <SetMapView location={location} />
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[location.lat, location.lng]} icon={iconUser}>
          <Popup>📍 Lokasi Anda</Popup>
        </Marker>
        <Marker position={[mahativeStudio.lat, mahativeStudio.lng]}>
          <Popup>🏢 Mahative Studio</Popup>
        </Marker>
        <Circle
          center={[mahativeStudio.lat, mahativeStudio.lng]}
          radius={RADIUS_METER}
          pathOptions={{
            fillColor: isOutside ? '#f87171aa' : '#40A57888',
            color: isOutside ? '#ef4444' : '#006769',
            weight: 2,
            fillOpacity: 0.3,
          }}
        />
      </MapContainer>

      {distance !== null && (
        <p className="text-center text-sm mt-2 text-gray-600 dark:text-gray-300">
          Jarak dari Mahative Studio:{' '}
          <strong className={isOutside ? 'text-red-600' : 'text-green-600'}>
            {Math.round(distance)} meter
          </strong>
        </p>
      )}
    </div>
  );
}

export default UserLocationMap;
