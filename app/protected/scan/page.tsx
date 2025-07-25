'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import QRScanner from './qrscan';

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
        `).limit(6).order('created_at', { ascending: false });
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
    loadRecentAttendance();
  };

  const handleScanError = (error: string) => {
    console.error('Scan error:', error);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("id-ID", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen py-10">
      <div className="w-full mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            📲 Sistem Absensi
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Scan QR Code untuk mencatat kehadiran secara otomatis
          </p>
        </div>

        {/* Grid Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* QR Scanner */}
          <div className="bg-white dark:bg-slate-800 shadow-md rounded-xl p-6">
            <h2 className="text-2xl font-bold text-center mb-6">📷 QR Scanner</h2>
            <QRScanner onScanSuccess={handleScanSuccess} onScanError={handleScanError} />
          </div>

          {/* Daftar Kehadiran */}
          <div className="bg-white dark:bg-slate-800 shadow-md rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Riwayat Kehadiran Terbaru
            </h2>

            {loading ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mx-auto"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Memuat data...</p>
              </div>
            ) : recentAttendance?.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-10">
                Belum ada data absensi.
              </p>
            ) : (
              <div className="space-y-4">
                {recentAttendance.map((record) => (
                  <div
                    key={record.id}
                    className="flex justify-between items-center bg-gray-50 dark:bg-slate-700 px-4 py-3 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{record.users?.name || 'Pengguna Tidak Diketahui'}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{['hadir','terlambat'].includes(record.status.toLowerCase()) ? formatTimestamp(record.check_in) : formatTimestamp(record.created_at)}</p>
                    </div>
                    {(() => {
                      let statusLabel = record.status;
                      let statusColor = 'bg-green-100 text-green-800';
                      if (record.status.toLowerCase() === 'hadir' && record.check_in) {
                        const jamMenit = new Date(record.check_in);
                        const jam = jamMenit.getHours();
                        const menit = jamMenit.getMinutes();
                        if (jam > 8 || (jam === 8 && menit > 0)) {
                          statusLabel = 'TERLAMBAT';
                          statusColor = 'bg-red-100 text-red-800';
                        }
                      } else if (record.status.toLowerCase() === 'izin') {
                        statusColor = 'bg-yellow-100 text-yellow-800';
                      } else if (record.status.toLowerCase() === 'terlambat') {
                        statusColor = 'bg-red-100 text-red-800';
                      }
                      return (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor}`}>
                          {statusLabel}
                        </span>
                      );
                    })()}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tips */}
        <div className="mt-12 bg-blue-100 dark:bg-slate-700/40 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-white mb-4">
            ℹ️ Tips Pemindaian QR
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800 dark:text-blue-200">
            <div>
              <h4 className="font-semibold mb-2">Masalah Umum:</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Cahaya ruangan terlalu gelap</li>
                <li>Kode QR buram atau terlalu kecil</li>
                <li>QR tidak berisi <code>user_id</code></li>
                <li>Izin kamera belum diberikan</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Solusi Cepat:</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Pastikan pencahayaan cukup</li>
                <li>Pastikan QR dalam posisi jelas dan stabil</li>
                <li>Gunakan QR dari halaman profil masing-masing</li>
                <li>Refresh halaman & izinkan kamera</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
