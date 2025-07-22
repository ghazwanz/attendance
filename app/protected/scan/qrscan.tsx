'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { Camera, CameraOff } from 'lucide-react';

interface QRScannerProps {
  onScanSuccess?: (userId: string) => void;
  onScanError?: (error: string) => void;
}

export default function QRScanner({ onScanSuccess, onScanError }: QRScannerProps) {
  const supabase = createClient();
  const scannerRef = useRef<HTMLDivElement>(null);
  const [cameraFacingMode, setCameraFacingMode] = useState<'environment' | 'user'>('environment');
  const [showIzinForm, setShowIzinForm] = useState(false);
  const [izinReason, setIzinReason] = useState('');
  const izinDataRef = useRef<{ user_id: string; name: string } | null>(null);

  useEffect(() => {
    if (!scannerRef.current) return;

    const scanner = new Html5QrcodeScanner(
      scannerRef.current.id,
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        rememberLastUsedCamera: false,
        aspectRatio: 1.0,
      },
      false
    );

    scanner.render(onScanSuccessHandler, onScanErrorHandler);

    return () => {
      scanner.clear().catch((error) => {
        console.error('Failed to clear QR scanner.', error);
      });
    };
  }, [cameraFacingMode]);

  const onScanSuccessHandler = async (decodedText: string) => {
    try {
      toast.dismiss();
      toast.loading('Memproses scan...', { id: 'scan-process' });

      const data = JSON.parse(decodedText);
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('name')
        .eq('id', data.user_id)
        .single();

      if (userError || !userData) throw new Error('User tidak ditemukan');

      const user = userData;

      if (data.status === 'IZIN') {
        izinDataRef.current = { user_id: data.user_id, name: user.name };
        setShowIzinForm(true);
        toast.dismiss('scan-process');
        return;
      }

      const { error: insertError } = await supabase.from('attendances').insert({
        user_id: data.user_id,
        date: new Date().toISOString(),
        check_in: new Date().toISOString(),
        check_out: null,
        notes: '',
        created_at: new Date().toISOString(),
        status: data.status || 'HADIR',
      });

      if (insertError) throw new Error('Gagal menyimpan data absensi');

      toast.success(`✅ Berhasil scan untuk ${user.name}`, { id: 'scan-process' });
      if (onScanSuccess) onScanSuccess(data.user_id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal memproses QR';
      toast.error(`❌ ${message}`, { id: 'scan-process' });
      if (onScanError) onScanError(message);
    }
  };

  const onScanErrorHandler = (errorMessage: string) => {
    console.warn(`QR Scan Error: ${errorMessage}`);
  };

  const handleIzinSubmit = async () => {
    if (!izinReason.trim() || !izinDataRef.current) {
      toast.error('Mohon isi keterangan izin');
      return;
    }

    try {
      const { user_id, name } = izinDataRef.current;

      const { error: insertError } = await supabase.from('attendances').insert({
        user_id,
        date: new Date().toISOString(),
        check_in: null,
        check_out: null,
        notes: izinReason,
        created_at: new Date().toISOString(),
        status: 'IZIN',
      });

      if (insertError) throw new Error('Gagal menyimpan izin');

      toast.success(`✅ Izin berhasil untuk ${name}`);
      setShowIzinForm(false);
      setIzinReason('');
      izinDataRef.current = null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menyimpan izin';
      toast.error(`❌ ${message}`);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-gradient-to-br from-[#1c2431] to-[#2c3e50] rounded-2xl shadow-2xl text-white">
      <h2 className="text-3xl font-bold text-center mb-6">📷 QR Absensi Pegawai</h2>

      <div className="flex justify-center mb-4 space-x-2">
        <button
          onClick={() => setCameraFacingMode('environment')}
          className={`flex items-center gap-2 px-4 py-2 rounded-l-full transition text-sm font-medium shadow ${
            cameraFacingMode === 'environment' ? 'bg-teal-600 text-white' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          <Camera className="w-4 h-4" /> Belakang
        </button>
        <button
          onClick={() => setCameraFacingMode('user')}
          className={`flex items-center gap-2 px-4 py-2 rounded-r-full transition text-sm font-medium shadow ${
            cameraFacingMode === 'user' ? 'bg-teal-600 text-white' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          <CameraOff className="w-4 h-4" /> Depan
        </button>
      </div>

      <div
        id="reader"
        ref={scannerRef}
        className="rounded-xl border border-dashed border-teal-400 p-4 bg-black/20 text-center"
      >
        <p className="text-gray-300">Izinkan kamera dan arahkan QR</p>
      </div>

      {showIzinForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md text-gray-800 shadow-xl animate-fade-in">
            <h2 className="text-xl font-bold mb-4">✏️ Form Keterangan Izin</h2>
            <textarea
              value={izinReason}
              onChange={(e) => setIzinReason(e.target.value)}
              placeholder="Contoh: Sakit, urusan keluarga..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none h-28"
            />
            <div className="flex justify-end mt-4 space-x-3">
              <button
                onClick={() => {
                  setShowIzinForm(false);
                  setIzinReason('');
                  izinDataRef.current = null;
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Batal
              </button>
              <button
                onClick={handleIzinSubmit}
                className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
