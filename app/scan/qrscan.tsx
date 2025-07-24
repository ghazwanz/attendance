'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeCameraScanConfig } from 'html5-qrcode';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

// Fungsi utilitas untuk notifikasi
const showToast = ({ type, message }: { type: 'success' | 'error' | 'info' | 'warning'; message: string }) => {
  const baseStyle = {
    borderRadius: '8px',
    padding: '10px 16px',
    fontWeight: 'bold',
  };

  const colorMap = {
    success: {
      background: '#16a34a',
      color: '#fff',
      icon: '✅',
    },
    error: {
      background: '#dc2626',
      color: '#fff',
      icon: '❌',
    },
    info: {
      background: '#2563eb',
      color: '#fff',
      icon: 'ℹ️',
    },
    warning: {
      background: '#eab308',
      color: '#000',
      icon: '⚠️',
    },
  };

  const { background, color, icon } = colorMap[type];

  toast(`${icon} ${message}`, {
    style: {
      ...baseStyle,
      background,
      color,
    },
  });
};

type QRScannerProps = {
  onScanSuccess?: (userId: string) => void;
  onScanError?: (error: string) => void;
};

export default function QRScanner({ onScanSuccess, onScanError }: QRScannerProps) {
  const supabase = createClient();
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isScanning, setIsScanning] = useState(false);
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [showIzinForm, setShowIzinForm] = useState(false);
  const [showPulangModal, setShowPulangModal] = useState(false);
  const [izinReason, setIzinReason] = useState('');
  const [balikLagi, setBalikLagi] = useState(false);
  const scanUserRef = useRef<{ user_id: string; name: string } | null>(null);

  const startScan = async () => {
    if (!scannerRef.current) return;

    const html5QrCode = new Html5Qrcode(scannerRef.current.id);
    html5QrCodeRef.current = html5QrCode;

    const config: Html5QrcodeCameraScanConfig = { fps: 30, qrbox: { width: 250, height: 250 } };

    try {
      await html5QrCode.start(
        { facingMode },
        config,
        async (decodedText) => {
          toast.dismiss();
          toast.loading('⏳ Memproses scan...', { id: 'scan-process' });

          try {
            const data = JSON.parse(decodedText);
            const { data: userData, error } = await supabase.from('users').select('name').eq('id', data.user_id).single();

            if (error || !userData) throw new Error('User tidak ditemukan');

            scanUserRef.current = { user_id: data.user_id, name: userData.name };
            const today = new Date().toISOString().split('T')[0];
            const { data: attendanceToday } = await supabase.from('attendances').select('*').eq('user_id', data.user_id).like('date', `${today}%`).limit(1).single();

            toast.dismiss('scan-process');
            await stopScan();

            if (attendanceToday && attendanceToday.check_in && !attendanceToday.check_out) {
              setShowPulangModal(true);
            } else {
              setShowChoiceModal(true);
            }
          } catch (err) {
            showToast({ type: 'error', message: (err as Error).message });
            toast.dismiss('scan-process');
          }
        },
        (errorMessage) => console.warn(errorMessage)
      );
      setIsScanning(true);
    } catch (err) {
      showToast({ type: 'error', message: 'Gagal memulai kamera' });
    }
  };

  const stopScan = async () => {
    if (html5QrCodeRef.current) {
      await html5QrCodeRef.current.stop();
      await html5QrCodeRef.current.clear();
      html5QrCodeRef.current = null;
      setIsScanning(false);
    }
  };

  const handleAbsenHadir = async () => {
    if (!scanUserRef.current) return;
    try {
      const { user_id, name } = scanUserRef.current;
      const now = new Date().toISOString();

      const { error } = await supabase.from('attendances').insert({
        user_id,
        date: now,
        check_in: now,
        check_out: null,
        notes: '',
        created_at: now,
        status: 'HADIR',
      });

      if (error) throw new Error('Gagal menyimpan kehadiran');

      showToast({ type: 'success', message: `Berhasil hadir untuk ${name}` });
    } catch (err) {
      showToast({ type: 'error', message: (err as Error).message });
    } finally {
      setShowChoiceModal(false);
    }
  };

  const handleAbsenIzin = () => {
    setShowChoiceModal(false);
    setShowIzinForm(true);
  };

  const handleSubmitIzin = async () => {
    if (!izinReason.trim() || !scanUserRef.current) {
      showToast({ type: 'error', message: 'Mohon isi alasan izin' });
      return;
    }

    try {
      const { user_id, name } = scanUserRef.current;
      const now = new Date().toISOString();

      const { error } = await supabase.from('attendances').insert({
        user_id,
        date: now,
        check_in: null,
        check_out: null,
        notes: izinReason,
        created_at: now,
        status: 'IZIN',
      });

      if (error) throw new Error('Gagal menyimpan izin');

      showToast({ type: 'warning', message: `Izin berhasil untuk ${name}` });
      setIzinReason('');
      setShowIzinForm(false);
    } catch (err) {
      showToast({ type: 'error', message: (err as Error).message });
    }
  };

  const handlePulang = async () => {
    if (!scanUserRef.current) return;
    try {
      const { user_id, name } = scanUserRef.current;
      const now = new Date().toISOString();

      const { error } = await supabase.from('attendances').update({ check_out: now }).eq('user_id', user_id).like('date', `${now.split('T')[0]}%`);

      if (error) throw new Error('Gagal mencatat pulang');

      showToast({ type: 'info', message: `Pulang dicatat untuk ${name}` });
    } catch (err) {
      showToast({ type: 'error', message: (err as Error).message });
    } finally {
      setShowPulangModal(false);
    }
  };

  const handleIzinPulang = async () => {
    if (!izinReason.trim() || !scanUserRef.current) {
      showToast({ type: 'error', message: 'Isi alasan izin keluar' });
      return;
    }

    try {
      const { user_id, name } = scanUserRef.current;
      const now = new Date().toISOString();

      const { error } = await supabase.from('attendances').update({
        check_out: now,
        notes: `IZIN KELUAR: ${izinReason} | Balik lagi: ${balikLagi ? 'Ya' : 'Tidak'}`,
      }).eq('user_id', user_id).like('date', `${now.split('T')[0]}%`);

      if (error) throw new Error('Gagal menyimpan izin pulang');

      showToast({ type: 'info', message: `Izin keluar berhasil untuk ${name}` });
      setIzinReason('');
      setBalikLagi(false);
      setShowPulangModal(false);
    } catch (err) {
      showToast({ type: 'error', message: (err as Error).message });
    }
  };

  return (
  <div className="p-6 max-w-lg mx-auto rounded-2xl shadow-2xl bg-white text-gray-900 dark:bg-[#1c2431] dark:text-white transition-colors duration-300">
    <div className="mb-4 text-center">
      <label className="block mb-2 font-medium text-sm">Pilih Kamera</label>
      <select
        value={facingMode}
        onChange={(e) => setFacingMode(e.target.value as 'user' | 'environment')}
        className="w-48 px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-white"
      >
        <option value="environment">Belakang</option>
        <option value="user">Depan</option>
      </select>
    </div>

    <div
      id="reader"
      ref={scannerRef}
      className="rounded-xl border border-dashed border-teal-400 p-4 bg-gray-100 dark:bg-gray-800 text-center transition-colors"
      style={{ minHeight: 200 }}
    >
      <p className="text-gray-600 dark:text-gray-300">Izinkan kamera dan arahkan QR</p>
    </div>

    <div className="flex justify-center mt-4 space-x-4">
      <button
        onClick={startScan}
        disabled={isScanning}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
      >
        Mulai
      </button>
      <button
        onClick={stopScan}
        disabled={!isScanning}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
      >
        Stop
      </button>
    </div>

    {/* Modal Pilihan Hadir / Izin Tidak Hadir */}
    {showChoiceModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-sm shadow-xl text-gray-900 dark:text-white">
          <h2 className="text-lg font-semibold mb-4 text-center">Pilih Kehadiran</h2>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleAbsenHadir}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              ✅ Hadir
            </button>
            <button
              onClick={handleAbsenIzin}
              className="w-full px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
            >
              📝 Izin Tidak Hadir
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Modal Jika Sudah Hadir */}
    {showPulangModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-sm shadow-xl text-gray-900 dark:text-white">
          <h2 className="text-lg font-semibold mb-4 text-center">Sudah Hadir</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 text-center">Pilih tindakan selanjutnya</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={handlePulang}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              🏁 Pulang
            </button>
            <button
              onClick={() => {
                setShowPulangModal(false);
                setShowIzinForm(true);
              }}
              className="w-full px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
            >
              🚪 Izin Pulang Awal
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Form Izin */}
    {showIzinForm && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-xl text-gray-900 dark:text-white">
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2">📝 Keterangan Izin</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Silakan isi alasan Anda dengan jelas.
          </p>

          <div className="mb-4">
            <label
              htmlFor="izinReason"
              className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1"
            >
              Alasan
            </label>
            <textarea
              id="izinReason"
              value={izinReason}
              onChange={(e) => setIzinReason(e.target.value)}
              placeholder="Contoh: Sakit, urusan keluarga..."
              className="w-full p-3 border border-teal-500 bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none h-28 placeholder:text-gray-400 transition"
            />
          </div>

          {/* Tampilkan checkbox jika ini adalah izin pulang */}
          {showPulangModal && (
            <div className="mb-4 flex items-center">
              <input
                id="balikLagi"
                type="checkbox"
                checked={balikLagi}
                onChange={(e) => setBalikLagi(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="balikLagi" className="text-sm">Saya akan kembali ke kantor</label>
            </div>
          )}

          <div className="flex justify-end mt-6 space-x-3">
            <button
              onClick={() => {
                setShowIzinForm(false);
                setIzinReason('');
                setShowPulangModal(false);
              }}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition"
            >
              Batal
            </button>
            <button
              onClick={showPulangModal ? handleIzinPulang : handleSubmitIzin}
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition"
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