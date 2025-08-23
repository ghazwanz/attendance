"use client"

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUserLocationStores } from '@/lib/stores/useLocationStores';

type StudioLocation = {
    location_name: string;
    latitude: number;
    longtitude: number; // keeping original typo
};

export default function LocationDebugger() {
    const [isVisible, setIsVisible] = useState(false);
    const [companies, setCompanies] = useState<StudioLocation[]>([]);
    const userLocation = useUserLocationStores((state) => state.location);
    const supabase = createClient();

    // Toggle debug panel
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                setIsVisible(!isVisible);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isVisible]);

    // Fetch company locations
    useEffect(() => {
        const fetchCompanies = async () => {
            const { data, error } = await supabase
                .from('location_company')
                .select('location_name, latitude, longtitude');

            if (data) setCompanies(data);
        };

        fetchCompanies();
    }, [supabase]);

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371e3;
        const toRad = (x: number) => (x * Math.PI) / 180;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    if (!isVisible) {
        return (
            <div className="fixed bottom-4 right-4 z-50">
                <button
                    onClick={() => setIsVisible(true)}
                    className="bg-blue-500 text-white px-3 py-2 rounded-lg text-sm shadow-lg hover:bg-blue-600"
                >
                    🐛 Debug Location
                </button>
            </div>
        );
    }

    return (
        <div className="fixed inset-4 bg-white border-2 border-gray-300 rounded-lg shadow-2xl z-50 overflow-auto">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                <h2 className="text-lg font-bold">🐛 Location Debugger</h2>
                <div className="space-x-2">
                    <button
                        onClick={() => copyToClipboard(JSON.stringify({ userLocation, companies }, null, 2))}
                        className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                    >
                        📋 Copy Data
                    </button>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                    >
                        ✕ Close
                    </button>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* User Location */}
                <div className="bg-blue-50 p-3 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">👤 User Location</h3>
                    {userLocation ? (
                        <div className="text-sm space-y-1">
                            <div><strong>Latitude:</strong> {userLocation.lat}</div>
                            <div><strong>Longitude:</strong> {userLocation.lng}</div>
                            <div><strong>Coordinates:</strong> {userLocation.lat}, {userLocation.lng}</div>
                            <button
                                onClick={() => copyToClipboard(`${userLocation.lat}, ${userLocation.lng}`)}
                                className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1 hover:bg-blue-600"
                            >
                                📋 Copy Coords
                            </button>
                            <a
                                href={`https://maps.google.com/?q=${userLocation.lat},${userLocation.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-green-500 text-white px-2 py-1 rounded text-xs ml-2 hover:bg-green-600 inline-block"
                            >
                                🗺️ View on Maps
                            </a>
                        </div>
                    ) : (
                        <div className="text-red-600">❌ No user location detected</div>
                    )}
                </div>

                {/* Company Locations */}
                <div className="bg-green-50 p-3 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-2">🏢 Company Locations</h3>
                    {companies.length > 0 ? (
                        <div className="space-y-3">
                            {companies.map((company, index) => {
                                const distance = userLocation
                                    ? calculateDistance(userLocation.lat, userLocation.lng, company.latitude, company.longtitude)
                                    : null;

                                return (
                                    <div key={index} className="bg-white p-3 rounded border">
                                        <h4 className="font-medium text-gray-800">{company.location_name}</h4>
                                        <div className="text-sm space-y-1 mt-1">
                                            <div><strong>Latitude:</strong> {company.latitude}</div>
                                            <div><strong>Longitude:</strong> {company.longtitude}</div>
                                            <div><strong>Coordinates:</strong> {company.latitude}, {company.longtitude}</div>
                                            {distance !== null && (
                                                <div className={`font-medium ${distance > 1000 ? 'text-red-600' : distance > 100 ? 'text-yellow-600' : 'text-green-600'}`}>
                                                    <strong>Distance:</strong> {distance > 1000 ? `${(distance / 1000).toFixed(2)}km` : `${Math.round(distance)}m`}
                                                </div>
                                            )}
                                            <div className="space-x-2 mt-2">
                                                <button
                                                    onClick={() => copyToClipboard(`${company.latitude}, ${company.longtitude}`)}
                                                    className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                                                >
                                                    📋 Copy Coords
                                                </button>
                                                <a
                                                    href={`https://maps.google.com/?q=${company.latitude},${company.longtitude}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 inline-block"
                                                >
                                                    🗺️ View on Maps
                                                </a>
                                                {userLocation && (
                                                    <a
                                                        href={`https://maps.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${company.latitude},${company.longtitude}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="bg-purple-500 text-white px-2 py-1 rounded text-xs hover:bg-purple-600 inline-block"
                                                    >
                                                        🧭 Directions
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-red-600">❌ No company locations found</div>
                    )}
                </div>

                {/* Potential Issues */}
                <div className="bg-yellow-50 p-3 rounded-lg">
                    <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Potential Issues</h3>
                    <div className="text-sm space-y-2">
                        {!userLocation && (
                            <div className="text-red-600">❌ User location not available - check GPS permissions</div>
                        )}
                        {companies.length === 0 && (
                            <div className="text-red-600">❌ No company locations in database</div>
                        )}
                        {companies.some(c => !c.latitude || !c.longtitude || isNaN(c.latitude) || isNaN(c.longtitude)) && (
                            <div className="text-red-600">❌ Invalid coordinates detected in company data</div>
                        )}
                        {userLocation && companies.some(c => {
                            const distance = calculateDistance(userLocation.lat, userLocation.lng, c.latitude, c.longtitude);
                            return distance > 50000; // More than 50km
                        }) && (
                                <div className="text-red-600">❌ Extremely large distances detected - check coordinate accuracy</div>
                            )}
                        {companies.some(c => Math.abs(c.latitude) > 90 || Math.abs(c.longtitude) > 180) && (
                            <div className="text-red-600">❌ Coordinates outside valid Earth range</div>
                        )}
                    </div>
                </div>

                {/* Instructions */}
                <div className="bg-gray-50 p-3 rounded-lg text-sm">
                    <h3 className="font-semibold mb-2">📝 Debug Instructions</h3>
                    <ul className="space-y-1 text-gray-700">
                        <li>• Press <kbd className="bg-gray-200 px-1 rounded">Ctrl+Shift+D</kbd> to toggle this panel</li>
                        <li>• Click "View on Maps" to verify coordinates are correct</li>
                        <li>• Check browser console for detailed logs</li>
                        <li>• Copy data and share with developer if issues persist</li>
                        <li>• Large distances usually indicate wrong coordinates in database</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}