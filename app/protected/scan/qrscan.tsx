'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType, Html5QrcodeResult } from 'html5-qrcode';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

interface QRScannerProps {
  onScanSuccess?: (userId: string) => void;
  onScanError?: (error: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScanSuccess, onScanError }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const supabase = createClient();

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, []);

  const startScanning = () => {
    setIsScanning(true);
    setError(null);
    setSuccess(null);

    const config = {
      fps: 30,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      disableFlip: false,
      supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
      experimentalFeatures: {
        useBarCodeDetectorIfSupported: true
      },
      videoConstraints: {
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    };

    scannerRef.current = new Html5QrcodeScanner("qr-reader", config, false);

    const onScanSuccessHandler = async (decodedText: any, decodedResult: Html5QrcodeResult) => {
      try {
        toast.loading('Memproses QR Code...', { id: 'scan-process' });

        const data = JSON.parse(decodedText);
        if (!data?.user_id) throw new Error('QR tidak valid, user_id tidak ditemukan');

        await scannerRef.current?.clear();
        setIsScanning(false);

        const { data: user, error: userError } = await supabase
          .from('users')
          .select('id, name, role')
          .eq('id', data.user_id)
          .single();

        if (userError || !user) throw new Error('User tidak ditemukan di database');

        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        const { data: existingAttendance, error: fetchError } = await supabase
          .from('attendances')
          .select('*')
          .eq('user_id', data.user_id)
          .eq('date', today)
          .limit(1);

        if (fetchError) throw new Error('Gagal mengecek data absensi');

        if (!existingAttendance || existingAttendance.length === 0) {
          // Check-in
          const status = new Date().getHours() < 8 ? 'HADIR' : 'TERLAMBAT';

          const { error: insertError } = await supabase
            .from('attendances')
            .insert({
              user_id: data.user_id,
              date: new Date().toISOString(),
              check_in: new Date().toISOString(),
              check_out: null,
              notes: '',
              created_at: new Date().toISOString(),
              status: status,
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
            // Hitung selisih jam
            const checkInTime = new Date(record.check_in);
            const now = new Date();

            const diffInMs = now.getTime() - checkInTime.getTime();
            const diffInHours = diffInMs / (1000 * 60 * 60);

            if (diffInHours < 8) {
              const remaining = (8 - diffInHours).toFixed(2);
              setError(`Belum bisa check-out, sisa waktu kerja ${remaining} jam`);
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

        onScanSuccess?.(data.user_id);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Terjadi kesalahan saat memproses scan';
        setError(message);
        setIsScanning(false);
        toast.error(`❌ ${message}`, { id: 'scan-process' });
        onScanError?.(message);
      }
    };

    const onScanFailure = (error: string) => {
      if (
        !error.includes('No MultiFormat Readers') &&
        !error.includes('NotFoundException') &&
        !error.includes('No QR code found')
      ) {
        console.warn('QR scan warning:', error);
      }
    };

    scannerRef.current.render(onScanSuccessHandler, onScanFailure);
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      await scannerRef.current.clear();
      setIsScanning(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">QR Code Attendance Scanner</h2>

      <div className="mb-6">
        <div id="qr-reader" className={`${isScanning ? 'block' : 'hidden'}`}></div>
        {!isScanning && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div className="text-gray-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <p className="text-gray-600">Klik "Start Scanning" untuk memulai</p>
          </div>
        )}
      </div>

      <div className="flex gap-4 justify-center">
        {!isScanning ? (
          <button
            onClick={startScanning}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Start Scanning
          </button>
        ) : (
          <button
            onClick={stopScanning}
            className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Stop Scanning
          </button>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <p className="text-sm font-medium">Error: {error}</p>
        </div>
      )}

      {success && (
        <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          <p className="text-sm font-medium">Success: {success}</p>
        </div>
      )}

      <div className="mt-6 text-sm text-gray-600">
        <h3 className="font-medium mb-2">Petunjuk:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Izinkan akses kamera jika diminta</li>
          <li>Pastikan QR code berada dalam kotak scan</li>
          <li>Gunakan pencahayaan yang baik</li>
          <li>QR code harus mengandung user_id</li>
        </ul>
      </div>
    </div>
  );
};

export default QRScanner;
  