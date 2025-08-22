"use client"

import { useEffect, useState } from 'react';
import { showToast } from '@/lib/utils/toast';
import { isMobileDevice, hasGPSCapability } from '@/lib/utils/getUserLocation';

export default function DeviceLocationGuard() {
    const [hasShownWarning, setHasShownWarning] = useState(false);
    const [deviceInfo, setDeviceInfo] = useState({
        isMobile: false,
        hasGPS: false,
        userAgent: '',
    });

    useEffect(() => {
        // Set device information
        const isMobile = isMobileDevice();
        const hasGPS = hasGPSCapability();

        setDeviceInfo({
            isMobile,
            hasGPS,
            userAgent: navigator.userAgent,
        });

        // Show appropriate warnings
        if (!hasShownWarning) {
            if (!navigator.geolocation) {
                console.log({
                    type: 'error',
                    message: 'Perangkat tidak mendukung deteksi lokasi. Hubungi admin untuk bantuan.'
                });
            } else if (!isMobile) {
                console.log({
                    type: 'warning',
                    message: '⚠️ Untuk akurasi terbaik, gunakan smartphone untuk absensi. Laptop/PC memiliki akurasi lokasi terbatas.'
                });
            } else if (isMobile && !hasGPS) {
                console.log({
                    type: 'warning',
                    message: '📱 Pastikan GPS/Location Services aktif di pengaturan perangkat untuk akurasi optimal.'
                });
            } else {
                // Mobile with GPS - show success message
                console.log({
                    type: 'success',
                    message: '✅ Perangkat mobile terdeteksi. Siap untuk absensi dengan akurasi tinggi.'
                });
            }

            setHasShownWarning(true);
        }

        // Log device capabilities for debugging
        console.log('Device Capabilities:', {
            isMobile,
            hasGPS,
            geolocationSupported: !!navigator.geolocation,
            userAgent: navigator.userAgent,
            screen: {
                width: window.screen.width,
                height: window.screen.height,
            },
            connection: (navigator as any).connection?.effectiveType || 'unknown',
        });

    }, [hasShownWarning]);

    // Request permissions on mobile devices
    useEffect(() => {
        const requestPermissions = async () => {
            if (!deviceInfo.isMobile || !navigator.geolocation) return;

            try {
                // Check if we can request permission
                if ('permissions' in navigator) {
                    const permission = await (navigator as any).permissions.query({ name: 'geolocation' });

                    console.log('Geolocation permission status:', permission.state);

                    if (permission.state === 'denied') {
                        console.log({
                            type: 'error',
                            message: 'Izin lokasi ditolak. Aktifkan di pengaturan browser untuk menggunakan fitur absensi.'
                        });
                    } else if (permission.state === 'prompt') {
                        console.log({
                            type: 'info',
                            message: 'Sistem akan meminta izin akses lokasi saat diperlukan untuk absensi.'
                        });
                    }
                }
            } catch (error) {
                console.log('Permission API not supported:', error);
            }
        };

        if (deviceInfo.isMobile) {
            requestPermissions();
        }
    }, [deviceInfo.isMobile]);

    // Show install prompt for PWA on mobile
    useEffect(() => {
        let deferredPrompt: any;

        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            deferredPrompt = e;

            // Show install suggestion after a delay
            setTimeout(() => {
                if (deviceInfo.isMobile) {
                    console.log({
                        type: 'info',
                        message: '💡 Pasang aplikasi ini di home screen untuk pengalaman terbaik!'
                    });
                }
            }, 10000); // Show after 10 seconds
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, [deviceInfo.isMobile]);

    // Component doesn't render anything visible
    return null;
}