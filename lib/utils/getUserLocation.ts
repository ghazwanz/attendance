"use client"

// Deteksi lokasi awal
import { useEffect, useState } from "react";
import { useLocationStores, useUserLocationStores } from "../stores/useLocationStores";

import { showToast } from "./toast";
import { createClient } from "../supabase/client";

export type StudioLocation = {
  location_name: string;
  latitude: number;
  longtitude: number;
}

const RADIUS_METER = 1000;
const mahativeStudio = { lat: -8.0017804, lng: 112.6075698 };

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

export function UseUserLocationEffect() {
  const setLocation = useUserLocationStores((state) => state.setLocation);
  const setIsOutside = useLocationStores((state) => state.setIsOutside);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const [stdLocation, setStdLocation] = useState<StudioLocation[]>([])
  const supabase = createClient();

  useEffect(() => {
    const handleGetStdLoc = async () => {
      try {
        const { data, error } = await supabase
          .from('location_company')
          .select('location_name, latitude, longtitude')

        if (error) {
          showToast({ type: 'error', message: `Gagal mendapatkan lokasi studio: ${error.message}` });
          console.error('Error fetching company locations:', error);
          setIsLoadingCompanies(false);
          return;
        }

        if (data && data.length > 0) {
          console.log('Company locations fetched:', data);
          setStdLocation(data);
        } else console.log('No company locations found in database');
      } catch (error) {
        console.error('Error fetching company locations:', error);
      } finally {
        setIsLoadingCompanies(false);
      }
    }
    handleGetStdLoc();
  }, [supabase])

  useEffect(() => {
    // if (!navigator.geolocation) return;
    if (isLoadingCompanies || !navigator.geolocation || stdLocation.length === 0) {
      console.log('Waiting for company locations...', {
        isLoadingCompanies,
        hasGeolocation: !!navigator.geolocation,
        companyCount: stdLocation.length
      });
      return;
    }

    console.log('Starting geolocation with company locations:', stdLocation);

    const handleLocation = (position: GeolocationPosition) => {
      const userLoc = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      setLocation(userLoc);

      let closestDistance = Infinity;
      let closestCompany: StudioLocation | any = null;

      stdLocation.forEach((company) => {
        const distance = getDistanceFromLatLonInMeters(
          userLoc.lat,
          userLoc.lng,
          company.latitude,
          company.longtitude
        );

        console.log(`Distance to ${company.location_name}: ${Math.round(distance)}m`);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestCompany = company;
        }
      });

      const isOutside = closestDistance > RADIUS_METER;
      setIsOutside(isOutside);

      if (closestCompany) {
        console.log(`Closest company: ${closestCompany?.location_name}, Distance: ${Math.round(closestDistance)}m, IsOutside: ${isOutside}`);
      }
    };

    const handleError = (err: GeolocationPositionError) => {
      console.error(`Failed to detect location: ${err.message}`);
      // Handle error as needed
      // showToast({type:"error", message:`Gagal mendapatkan Lokasi User: ${err.message}`})
      // setError(`Failed to detect location: ${err.message}`);
    };

    navigator.geolocation.getCurrentPosition(handleLocation, handleError, {
      enableHighAccuracy: true,
    });

    const watchId = navigator.geolocation.watchPosition(handleLocation, handleError, {
      enableHighAccuracy: true,
    });

    return () => navigator.geolocation.clearWatch(watchId);
  }, [setLocation, setIsOutside, stdLocation, isLoadingCompanies]);
  return null
}