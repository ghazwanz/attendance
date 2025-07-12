'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';

const QrReader = dynamic(() => import('react-qr-scanner'), { ssr: false });

export default function ScanAttendance() {
  const supabase = createClient();
  const [scannedData, setScannedData] = useState(null);
  const [message, setMessage] = useState('');

  const handleScan = async (data: string | null) => {
    if (data && !scannedData) {
      try {
        const parsed = JSON.parse(data); // ambil { id, name, role }
        const now = new Date();
        const today = now.toISOString().split('T')[0];

        // Simpan ke attendance
        const { error } = await supabase.from('attendances').insert({
          user_id: parsed.id,
          date: today,
          check_in: now.toISOString(),
          status: 'HADIR',
        });

        if (error) {
          console.error(error);
          setMessage('❌ Gagal menyimpan absensi.');
        } else {
          setMessage(`✅ Absensi berhasil untuk ${parsed.name}`);
          setScannedData(parsed); // mencegah double input
        }

        setTimeout(() => {
          setScannedData(null);
          setMessage('');
        }, 5000); // Reset setelah 5 detik
      } catch (err) {
        setMessage('QR tidak valid');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-900 text-black dark:text-white p-6">
      <h1 className="text-2xl font-bold mb-4">📸 Scan QR untuk Absensi</h1>

      {message && (
        <div className="mb-4 bg-blue-100 dark:bg-slate-800 text-sm p-3 rounded shadow">
          {message}
        </div>
      )}

      <div className="w-full max-w-md">
        <QrReader
          delay={500}
          onError={(err) => console.error(err)}
          onScan={handleScan}
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );
}
