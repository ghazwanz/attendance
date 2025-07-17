'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType, Html5QrcodeResult } from 'html5-qrcode';
import { QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';

const userMock = {
  id: 'user_id',
  name: 'Budi',
  role: 'employee'
};

export default function ProtectedPage() {
  const [userId, setUserId] = useState<string | undefined>(userMock.id);
  const [showScanner, setShowScanner] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const supabase = createClient();
  const qrData = JSON.stringify({ user_id: userId });

  useEffect(() => {
    const supabase = createClient();
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) window.location.href = '/auth/login';
      setUserId(user?.id);
    };
    checkAuth();
    return () => {
      if (scannerRef.current) scannerRef.current.clear().catch(console.error);
    };
  }, []);

  const startScanning = () => {
    setScanning(true);
    setError(null);
    setSuccess(null);

    const config = {
      fps: 30,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      disableFlip: false,
      supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
      experimentalFeatures: { useBarCodeDetectorIfSupported: true },
      videoConstraints: {
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    };

    scannerRef.current = new Html5QrcodeScanner('qr-reader', config, false);

    scannerRef.current.render(async (decodedText, decodedResult) => {
      try {
        toast.loading('Memproses QR Code...', { id: 'scan-process' });
        const data = JSON.parse(decodedText);
        if (!data?.user_id) throw new Error('QR tidak valid, user_id tidak ditemukan');

        await scannerRef.current?.clear();
        setScanning(false);

        const { data: user, error: userError } = await supabase
          .from('users')
          .select('id, name, role')
          .eq('id', data.user_id)
          .single();

        if (userError || !user) throw new Error('User tidak ditemukan di database');

        const today = new Date().toISOString().split('T')[0];
        const { data: existingAttendance, error: fetchError } = await supabase
          .from('attendances')
          .select('*')
          .eq('user_id', data.user_id)
          .eq('date', today)
          .limit(1);

        if (fetchError) throw new Error('Gagal mengecek data absensi');

        if (!existingAttendance || existingAttendance.length === 0) {
          let status = 'HADIR';
          const nowHour = new Date().getHours();
          if (user.role === 'IZIN') status = 'IZIN';
          else status = nowHour < 8 ? 'HADIR' : 'TERLAMBAT';

          const { error: insertError } = await supabase.from('attendances').insert({
            user_id: data.user_id,
            date: new Date().toISOString(),
            check_in: new Date().toISOString(),
            check_out: null,
            notes: '',
            created_at: new Date().toISOString(),
            status
          });

          if (insertError) throw new Error(`Gagal menyimpan absensi: ${insertError.message}`);

          setSuccess(`Check-in berhasil untuk ${user.name}`);
          toast.success(`✅ Check-in berhasil untuk ${user.name}`, { id: 'scan-process' });
        } else {
          const record = existingAttendance[0];
          if (record.check_out) {
            setError(`User ${user.name} sudah melakukan check-in dan check-out hari ini`);
            toast.error(`❌ ${user.name} sudah absen penuh hari ini`, { id: 'scan-process' });
          } else {
            if (user.role === 'IZIN') {
              setError(`User ${user.name} sedang izin, tidak perlu check-out`);
              toast.error(`❌ ${user.name} sedang dalam status izin`, { id: 'scan-process' });
              return;
            }

            const checkInTime = new Date(record.check_in);
            const now = new Date();
            const diffInHours = (now.getTime() - checkInTime.getTime()) / 36e5;

            if (diffInHours < 8) {
              setError(`Belum bisa check-out, sisa waktu kerja ${(8 - diffInHours).toFixed(2)} jam`);
              toast.error(`❌ Belum bisa check-out. Minimal 8 jam kerja`, { id: 'scan-process' });
            } else {
              const { error: updateError } = await supabase
                .from('attendances')
                .update({ check_out: now.toISOString() })
                .eq('id', record.id);

              if (updateError) throw new Error(`Gagal melakukan check-out: ${updateError.message}`);

              setSuccess(`Check-out berhasil untuk ${user.name}`);
              toast.success(`✅ Check-out berhasil untuk ${user.name}`, { id: 'scan-process' });
            }
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Terjadi kesalahan saat memproses scan';
        setError(message);
        setScanning(false);
        toast.error(`❌ ${message}`, { id: 'scan-process' });
      }
    }, (err) => {
      if (!err.includes('No MultiFormat Readers')) console.warn('Scan warning:', err);
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 dark:from-slate-900 dark:to-slate-800 px-4 py-10">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl rounded-2xl p-6 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">🏠 Beranda Absensi</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Klik tombol di bawah ini untuk menampilkan QR kamu atau scan kehadiran.</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <button onClick={() => setShowScanner(true)} className="flex items-center gap-2 justify-center w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold">
            <QrCode size={18} /> Tampilkan QR Saya
          </button>
          <button onClick={startScanning} disabled={scanning} className="flex items-center gap-2 justify-center w-full py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold">
            <QrCode size={18} /> Scan Kehadiran
          </button>
        </div>
      </div>

      {/* MODAL QR */}
      {showScanner && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl w-full max-w-xs relative">
            <button onClick={() => setShowScanner(false)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-lg">✖</button>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">📷 QR Anda</h2>
            <div className="text-center text-sm text-gray-600 dark:text-gray-300 mb-4">Tunjukkan QR ini ke scanner</div>
            <div className="flex justify-center">
              <QRCodeSVG value={qrData} size={200} />
            </div>
          </div>
        </div>
      )}

      {/* QR SCANNER */}
      {scanning && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg w-full max-w-lg relative">
            <button onClick={() => scannerRef.current?.clear().then(() => setScanning(false))} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-lg">✖</button>
            <div id="qr-reader" className="w-full"></div>
          </div>
        </div>
      )}
    </div>
  );
}
