// app/attendance/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import QRScanner from './qrscan'; // Adjust path as needed

interface AttendanceRecord {
  id: string;
  user_id: string;
  date: string;
  check_in: string;
  check_out: string;
  notes: string;
  created_at: string;
  status: string;
  users: {
    name: string;
    // email: string;
  };
}

export default function AttendancePage() {
  const [recentAttendance, setRecentAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadRecentAttendance();
  }, []);

  const loadRecentAttendance = async () => {
    try {
      const { data, error } = await supabase
        .from('attendances')
        .select(`
          *,
          users(
            name
          )
        `).limit(10).order('created_at', { ascending: false });
      console.log(data, error)
      if (error) throw error;
      setRecentAttendance(data || []);
    } catch (error) {
      console.error('Error loading attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScanSuccess = (userId: string) => {
    console.log('Attendance recorded for user:', userId);
    // Reload recent attendance to show the new record
    loadRecentAttendance();
  };

  const handleScanError = (error: string) => {
    console.error('Scan error:', error);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("id-ID", {
      year:"numeric",month:"2-digit",day:"2-digit",hour: "2-digit", minute: "2-digit",
    })
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Attendance System
          </h1>
          <p className="text-gray-600">
            Scan QR codes to record attendance
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Scanner */}
          <div>
            <QRScanner
              onScanSuccess={handleScanSuccess}
              onScanError={handleScanError}
            />
          </div>

          {/* Recent Attendance */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Recent Attendance
            </h2>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading...</p>
              </div>
            ) : recentAttendance?.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No attendance records yet
              </p>
            ) : (
              <div className="space-y-3">
                {recentAttendance?.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {record.users?.name || 'Unknown User'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatTimestamp(record.check_in)}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${record.status.toLowerCase() === 'hadir'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                      }`}>
                      {record.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Troubleshooting Tips */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            Troubleshooting QR Code Issues
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">Common Issues:</h4>
              <ul className="space-y-1">
                <li>• Poor lighting conditions</li>
                <li>• QR code too small or blurry</li>
                <li>• Wrong QR code format</li>
                <li>• Camera permission denied</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Solutions:</h4>
              <ul className="space-y-1">
                <li>• Ensure good lighting</li>
                <li>• Hold QR code steady</li>
                <li>• Check QR code contains user_id</li>
                <li>• Try refreshing the page</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}