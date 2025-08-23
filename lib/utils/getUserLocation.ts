"use client"

// Enhanced location detection with mobile-first approach
import { useEffect, useState } from "react";
import { useLocationStores, useUserLocationStores } from "../stores/useLocationStores";
import { showToast } from "./toast";
import { createClient } from "../supabase/client";
import toast from "react-hot-toast";

export type StudioLocation = {
  location_name: string;
  latitude: number;
  longtitude: number;
}

export type ToastStatus = {
  isOutside: boolean;
  lowAccuracy: boolean;
}

export type LocationMethod = 'gps_mobile' | 'gps_desktop' | 'ip_fallback' | 'denied';
export type LocationAccuracy = 'high' | 'medium' | 'low';

const RADIUS_METER = 1000;

// Device detection utilities
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

export const hasGPSCapability = (): boolean => {
  return 'geolocation' in navigator && isMobileDevice();
};

function getDistanceFromLatLonInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  // Validasi koordinat
  if (!lat1 || !lon1 || !lat2 || !lon2 ||
    isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
    return Infinity;
  }

  // Validasi range koordinat
  if (Math.abs(lat1) > 90 || Math.abs(lat2) > 90 ||
    Math.abs(lon1) > 180 || Math.abs(lon2) > 180) {
    return Infinity;
  }

  const R = 6371e3; // Earth's radius in meters
  const toRad = (x: number) => (x * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

// Determine location method and accuracy
const getLocationMethodAndAccuracy = (
  accuracy: number,
  isMobile: boolean
): { method: LocationMethod; accuracyLevel: LocationAccuracy } => {
  if (isMobile) {
    if (accuracy <= 20) return { method: 'gps_mobile', accuracyLevel: 'high' };
    if (accuracy <= 100) return { method: 'gps_mobile', accuracyLevel: 'medium' };
    return { method: 'gps_mobile', accuracyLevel: 'low' };
  } else {
    if (accuracy <= 100) return { method: 'gps_desktop', accuracyLevel: 'medium' };
    return { method: 'ip_fallback', accuracyLevel: 'low' };
  }
};

export function UseUserLocationEffect() {
  const setLocation = useUserLocationStores((state) => state.setLocation);
  const setIsOutside = useLocationStores((state) => state.setIsOutside);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const [stdLocation, setStdLocation] = useState<StudioLocation[]>([]);
  const [locationMethod, setLocationMethod] = useState<LocationMethod | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<LocationAccuracy>('low');
  const [accuracyRadius, setAccuracyRadius] = useState<number>(0);
  const [showMobileWarning, setShowMobileWarning] = useState(false);

  const supabase = createClient();
  const isMobile = isMobileDevice();

  useEffect(() => {
    const handleGetStdLoc = async () => {
      try {
        const { data, error } = await supabase
          .from('location_company')
          .select('location_name, latitude, longtitude')

        if (error) {
          console.log({ type: 'error', message: `Gagal mendapatkan lokasi studio: ${error.message}` });
          console.error('Error fetching company locations:', error);
          setIsLoadingCompanies(false);
          return;
        }

        if (data && data.length > 0) {
          console.log('Company locations fetched:', data);
          setStdLocation(data);
        } else {
          console.log('No company locations found in database');
        }
      } catch (error) {
        console.error('Error fetching company locations:', error);
      } finally {
        setIsLoadingCompanies(false);
      }
    }
    handleGetStdLoc();
  }, [supabase])

  // Show warning for desktop users
  useEffect(() => {
    if (!isMobile && !showMobileWarning) {
      setShowMobileWarning(true);
      console.log({
        type: 'error',
        message: 'Untuk akurasi lokasi terbaik, gunakan smartphone Anda untuk absensi. Akurasi laptop/desktop terbatas.'
      });
    }
  }, [isMobile, showMobileWarning]);

  useEffect(() => {
    if (isLoadingCompanies || !navigator.geolocation || stdLocation.length === 0) {
      console.log('Waiting for company locations...', {
        isLoadingCompanies,
        hasGeolocation: !!navigator.geolocation,
        companyCount: stdLocation.length
      });
      return;
    }

    console.log('Starting geolocation with company locations:', stdLocation);
    console.log('Device type:', isMobile ? 'Mobile' : 'Desktop');

    const handleLocation = (position: GeolocationPosition) => {
      const userLoc = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      const accuracy = position.coords.accuracy;
      const { method, accuracyLevel } = getLocationMethodAndAccuracy(accuracy, isMobile);

      setLocation(userLoc);
      setLocationMethod(method);
      setLocationAccuracy(accuracyLevel);
      setAccuracyRadius(accuracy);

      // Show accuracy warning for poor GPS
      if (accuracyLevel === 'low') {
        console.log({
          type: 'warning',
          message: `Akurasi GPS rendah (±${Math.round(accuracy)}m). ${isMobile ? 'Pastikan GPS aktif dan berada di area terbuka.' : 'Gunakan smartphone untuk akurasi lebih baik.'}`
        });
      }

      let closestDistance = Infinity;
      let closestCompany: StudioLocation | any = null;

      stdLocation.forEach((company) => {
        const distance = getDistanceFromLatLonInMeters(
          userLoc.lat,
          userLoc.lng,
          company.latitude,
          company.longtitude
        );

        if (distance < closestDistance) {
          closestDistance = distance;
          closestCompany = company;
        }
      });

      // Adjust radius check based on accuracy
      let effectiveRadius = RADIUS_METER;
      console.log(accuracy)
      // For low accuracy, increase tolerance
      if (accuracyLevel === 'low' && accuracy > 500) {
        effectiveRadius = RADIUS_METER + accuracy; // Add accuracy buffer
      }

      console.log(effectiveRadius)
      console.log(closestDistance)

      const isOutside = closestDistance > effectiveRadius;
      setIsOutside(isOutside);

      if (closestCompany) {
        // Show location status with better formatting
        if (isOutside) {
          const distanceKm = closestDistance > 1000 ? `${(closestDistance / 1000).toFixed(1)}km` : `${Math.round(closestDistance)}m`;
          console.log({
            type: 'warning',
            message: `Anda berada ${distanceKm} dari ${closestCompany.location_name}. Radius maksimal: ${Math.round(effectiveRadius)}m`
          });
        } else {
          console.log({
            type: 'success',
            message: `✅ Anda berada dalam radius ${closestCompany.location_name} (${Math.round(closestDistance)}m)`
          });
        }
      }
    };

    const handleError = (err: GeolocationPositionError) => {
      console.log(`Failed to detect location: ${err.message}`);
      setLocationMethod('denied');

      let errorMessage = 'Gagal mendapatkan lokasi: ';
      switch (err.code) {
        case err.PERMISSION_DENIED:
          errorMessage += 'Izin lokasi ditolak. Aktifkan izin lokasi di browser.';
          break;
        case err.POSITION_UNAVAILABLE:
          errorMessage += 'Informasi lokasi tidak tersedia.';
          break;
        case err.TIMEOUT:
          errorMessage += 'Permintaan lokasi timeout. Coba lagi.';
          break;
        default:
          errorMessage += err.message;
      }

      console.log({ type: 'error', message: errorMessage });
    };

    // Enhanced geolocation options
    const geoOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: isMobile ? 25000 : 20000, // Longer timeout for mobile GPS
      maximumAge: isMobile ? 30000 : 60000 // Fresher data for mobile
    };

    navigator.geolocation.getCurrentPosition(handleLocation, handleError, geoOptions);

    const watchId = navigator.geolocation.watchPosition(handleLocation, handleError, {
      ...geoOptions,
      maximumAge: isMobile ? 60000 : 300000 // Less frequent updates for desktop
    });

    return () => navigator.geolocation.clearWatch(watchId);
  }, [setLocation, setIsOutside, isLoadingCompanies]);

  // Return location metadata for components that might need it
  return {
    locationMethod,
    locationAccuracy,
    accuracyRadius,
    isMobile,
    hasGPS: hasGPSCapability()
  };
}