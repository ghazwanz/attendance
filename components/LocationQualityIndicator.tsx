"use client"

import { useEffect, useState } from 'react';
import { UseUserLocationEffect, LocationMethod, LocationAccuracy, isMobileDevice } from '@/lib/utils/getUserLocation';

interface LocationQualityProps {
    showInClockIn?: boolean;
    className?: string;
}

export default function LocationQualityIndicator({ showInClockIn = false, className = '' }: LocationQualityProps) {
    const locationInfo = UseUserLocationEffect();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Show indicator when location info is available and if configured to show
        if (locationInfo && (showInClockIn || locationInfo.locationAccuracy === 'low')) {
            setIsVisible(true);
        }
    }, [locationInfo, showInClockIn]);

    if (!isVisible || !locationInfo) return null;

    const getAccuracyColor = (accuracy: LocationAccuracy) => {
        switch (accuracy) {
            case 'high': return 'text-green-600 bg-green-50 border-green-200';
            case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'low': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getAccuracyIcon = (accuracy: LocationAccuracy) => {
        switch (accuracy) {
            case 'high': return '🎯';
            case 'medium': return '📍';
            case 'low': return '⚠️';
            default: return '📍';
        }
    };

    const getMethodDescription = (method: LocationMethod) => {
        switch (method) {
            case 'gps_mobile': return 'GPS Mobile';
            case 'gps_desktop': return 'GPS Desktop';
            case 'ip_fallback': return 'IP Location';
            case 'denied': return 'Akses Ditolak';
            default: return 'Tidak Diketahui';
        }
    };

    const getAccuracyDescription = (accuracy: LocationAccuracy, radius: number) => {
        switch (accuracy) {
            case 'high': return `Akurasi Tinggi (±${Math.round(radius)}m)`;
            case 'medium': return `Akurasi Sedang (±${Math.round(radius)}m)`;
            case 'low': return `Akurasi Rendah (±${Math.round(radius)}m)`;
            default: return `Tidak Diketahui (±${Math.round(radius)}m)`;
        }
    };

    const shouldShowImprovement = !locationInfo.isMobile || locationInfo.locationAccuracy === 'low';

    return (
        <div className={`${className} transition-all duration-300 ease-in-out`}>
            {/* Main Status Indicator */}
            <div className={`px-3 py-2 rounded-lg border ${getAccuracyColor(locationInfo.locationAccuracy)} flex items-center space-x-2`}>
                <span className="text-lg">{getAccuracyIcon(locationInfo.locationAccuracy)}</span>
                <div className="flex-1">
                    <div className="text-base font-medium">
                        {getAccuracyDescription(locationInfo.locationAccuracy, locationInfo.accuracyRadius)}
                    </div>
                    <div className="text-sm opacity-75">
                        {getMethodDescription(locationInfo.locationMethod!)} • {locationInfo.isMobile ? 'Mobile' : 'Desktop'}
                    </div>
                </div>
            </div>

            {/* Improvement Suggestions */}
            {shouldShowImprovement && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-base font-medium text-blue-800 mb-1">
                        💡 Tips untuk Akurasi Lebih Baik:
                    </div>
                    <ul className="text-sm text-blue-700 space-y-1">
                        {!locationInfo.isMobile && (
                            <li>• Gunakan smartphone untuk akurasi GPS terbaik</li>
                        )}
                        {locationInfo.isMobile && locationInfo.locationAccuracy === 'low' && (
                            <>
                                <li>• Pastikan GPS aktif di pengaturan perangkat</li>
                                <li>• Pindah ke area terbuka (hindari gedung tinggi)</li>
                                <li>• Tunggu beberapa detik untuk GPS stabil</li>
                            </>
                        )}
                        {!locationInfo.hasGPS && (
                            <li>• Aktifkan Location Services di pengaturan</li>
                        )}
                    </ul>
                </div>
            )}

            {/* Clock-in Specific Warnings */}
            {showInClockIn && locationInfo.locationAccuracy === 'low' && (
                <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="text-base font-medium text-orange-800 flex items-center space-x-2">
                        <span>⚠️</span>
                        <span>Perhatian Absensi</span>
                    </div>
                    <div className="text-sm text-orange-700 mt-1">
                        Akurasi rendah dapat mempengaruhi validasi lokasi absensi.
                        {!locationInfo.isMobile && ' Disarankan menggunakan smartphone.'}
                    </div>
                </div>
            )}
        </div>
    );
}