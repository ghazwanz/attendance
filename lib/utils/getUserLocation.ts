"useClient"

// Deteksi lokasi awal
import { useEffect } from "react";
import { useLocationStores, useUserLocationStores } from "../stores/useLocationStores";
import { showToast } from "./toast";

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

export function useUserLocationEffect() {
    const setLocation = useUserLocationStores((state) => state.setLocation);
    const setIsOutside = useLocationStores((state) => state.setIsOutside);

    useEffect(() => {
        if (!navigator.geolocation) return;

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
            setIsOutside(dist > RADIUS_METER);
        };

        const handleError = (err: GeolocationPositionError) => {
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
    }, [setLocation, setIsOutside]);
}