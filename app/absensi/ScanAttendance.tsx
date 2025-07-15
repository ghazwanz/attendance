'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';

const QrScanner = dynamic(() => import('react-qr-scanner'), { ssr: false });

export default function ScanAttendance() {
  const supabase = createClient();
  const [scannedData, setScannedData] = useState(null);
  const [message, setMessage] = useState('');
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('environment');

  const handleScan = async (data: string | null) => {
    if (data && !scannedData) {
      console.log('📥 Data hasil scan:', data);

      try {
        const parsed = JSON.parse(data); // QR berisi { id, name, role }
        console.log('✅ Data parsed:', parsed);

        const now = new Date();
        const today = now.toISOString().split('T')[0];

        setScannedData(parsed);

        // Cek apakah sudah absen hari ini
        const { data: existing, error: fetchError } = await supabase
          .from('attendances')
          .select('*')
          .eq('user_id', parsed.id)
          .eq('date', today)
          .maybeSingle();

        if (fetchError) {
          console.error('❌ Gagal cek absen:', fetchError);
          setMessage('❌ Gagal cek data absen.');
          return;
        }

        if (!existing) {
          console.log('📝 Menyimpan data absen masuk ke Supabase...');
          const { error: insertError } = await supabase.from('attendances').insert({
            user_id: parsed.id,
            name: parsed.name,
            date: today,
            check_in: now.toISOString(),
            status: 'HADIR',
          });

          if (insertError) {
            console.error('❌ Insert error:', insertError);
            setMessage('❌ Gagal simpan absen masuk.');
          } else {
            setMessage(`✅ ${parsed.name} absen masuk!`);
          }
        } else if (!existing.check_out) {
          const checkInTime = new Date(existing.check_in);
          const checkOutTime = new Date(checkInTime.getTime() + 8 * 60 * 60 * 1000);

          console.log('📝 Menyimpan data absen pulang...');
          const { error: updateError } = await supabase
            .from('attendances')
            .update({
              check_out: checkOutTime.toISOString(),
              status: 'PULANG',
            })
            .eq('id', existing.id);

          if (updateError) {
            console.error('❌ Update error:', updateError);
            setMessage('❌ Gagal simpan absen pulang.');
          } else {
            setMessage(`👋 ${parsed.name} absen pulang jam ${checkOutTime.toLocaleTimeString()}`);
          }
        } else {
          setMessage(`✅ ${parsed.name} sudah absen masuk & pulang hari ini.`);
        }

        // Reset
        setTimeout(() => {
          setScannedData(null);
          setMessage('');
        }, 5000);
      } catch (err) {
        console.error('❌ QR tidak valid:', err);
        setMessage('⚠️ QR tidak valid.');
      }
    }
  };

  const handleError = (err: any) => {
    console.error('❌ QR error:', err);
    setMessage('QR error.');
  };

  const toggleCamera = () => {
    setCameraFacing((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-900 text-black dark:text-white p-6">
      <h1 className="text-2xl font-bold mb-4">📸 Scan QR untuk Absensi</h1>

      {message && (
        <div className="mb-4 bg-blue-100 dark:bg-slate-800 text-sm p-3 rounded shadow">
          {message}
        </div>
      )}

      <button
        onClick={toggleCamera}
        className="mb-4 px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition"
      >
        Ganti Kamera ({cameraFacing === 'user' ? 'Depan' : 'Belakang'})
      </button>

      <div className="w-full max-w-md">
        <QrScanner
          delay={500}
          onError={handleError}
          onScan={handleScan}
          facingMode={cameraFacing}
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );
}
