'use client';

import React, { useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeCameraScanConfig } from 'html5-qrcode';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

export default function QRScanner({ onScanError, onScanSuccess }: {
  onScanError?: (error: string) => void
  onScanSuccess: (userId: string) => void;
}) {
  const supabase = createClient();
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isScanning, setIsScanning] = useState(false);
  const [showIzinForm, setShowIzinForm] = useState(false);
  const [izinReason, setIzinReason] = useState('');
  const [izinStart, setIzinStart] = useState('');
  const [izinEnd, setIzinEnd] = useState('');
  const izinDataRef = useRef<{ user_id: string; name: string } | null>(null);

  const startScan = async () => {
    if (!scannerRef.current) return;

    const html5QrCode = new Html5Qrcode(scannerRef.current.id);
    html5QrCodeRef.current = html5QrCode;

    const config: Html5QrcodeCameraScanConfig = {
      fps: 30,
      qrbox: { width: 250, height: 250 },
    };

    try {
      await html5QrCode.start(
        { facingMode },
        config,
        async (decodedText) => {
          toast.dismiss();
          toast.loading('⏳ Memproses scan...', { id: 'scan-process' });

          try {
            const data = JSON.parse(decodedText);
            const { data: userData, error } = await supabase
              .from('users')
              .select('name')
              .eq('id', data.user_id)
              .single();

            if (error || !userData) throw new Error('User tidak ditemukan');

            if (data.status === 'IZIN') {
              izinDataRef.current = { user_id: data.user_id, name: userData.name };
              setShowIzinForm(true);
              toast.dismiss('scan-process');
              await stopScan();
              return;
            }

            // Tentukan status HADIR/TERLAMBAT berdasarkan jam scan
            const now = new Date();
            const jam = now.getHours();
            const menit = now.getMinutes();
            let status = 'HADIR';
            if (jam > 8 || (jam === 8 && menit > 0)) {
              status = 'TERLAMBAT';
            }

            const attendanceObj = {
              user_id: data.user_id,
              date: now.toISOString(),
              check_in: now.toISOString(),
              check_out: null,
              notes: '',
              created_at: now.toISOString(),
              status: status,
            };
            const { error: insertError } = await supabase.from('attendances').insert([attendanceObj]);

            if (insertError) throw new Error('Gagal menyimpan data absensi');

            toast.success(`✅ Berhasil scan untuk ${userData.name}`, {
              id: 'scan-process',
              style: {
                background: '#16a34a',
                color: '#fff',
              },
            });

            await stopScan();
          } catch (err) {
            toast.error(`❌ ${(err as Error).message}`, {
              id: 'scan-process',
              style: {
                background: '#dc2626',
                color: '#fff',
              },
            });
          }
        },
        (errorMessage) => {
          console.warn(errorMessage);
        }
      );
      setIsScanning(true);
    } catch (err) {
      toast.error('❌ Gagal memulai kamera');
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

  const handleIzinSubmit = async () => {
    if (!izinReason.trim() || !izinDataRef.current || !izinStart || !izinEnd) {
      toast.error('Mohon isi tanggal mulai, hingga, dan alasan izin', {
        style: { background: '#dc2626', color: '#fff' },
      });
      return;
    }
    if (izinEnd < izinStart) {
      toast.error('Tanggal hingga tidak boleh sebelum tanggal mulai', {
        style: { background: '#dc2626', color: '#fff' },
      });
      return;
    }
    try {
      const { user_id, name } = izinDataRef.current;
      const now = new Date().toISOString();
      // Insert ke tabel permissions, field exit_time dan reentry_time
      const { error: insertError } = await supabase.from('permissions').insert({
        user_id,
        exit_time: izinStart,
        reentry_time: izinEnd,
        reason: izinReason,
        created_at: now,
        type: 'izin',
        status: 'pending',
      });
      if (insertError) throw new Error('Gagal menyimpan izin');
      toast.success(`✅ Izin berhasil untuk ${name}`, {
        style: { background: '#16a34a', color: '#fff' },
      });
      setShowIzinForm(false);
      setIzinReason('');
      setIzinStart('');
      setIzinEnd('');
      izinDataRef.current = null;
    } catch (err) {
      toast.error(`❌ ${(err as Error).message}`, {
        style: { background: '#dc2626', color: '#fff' },
      });
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

      {showIzinForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="bg-white dark:bg-[#1e293b] border border-teal-600 rounded-xl p-6 w-full max-w-md text-gray-900 dark:text-white shadow-xl animate-fade-in">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">📝 Keterangan Izin</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Silakan isi tanggal izin dan alasan Anda dengan jelas.
            </p>

            <div className="mb-4">
              <label htmlFor="izinStart" className="block text-sm font-medium mb-1">Mulai Izin</label>
              <input
                type="date"
                id="izinStart"
                value={izinStart}
                onChange={e => setIzinStart(e.target.value)}
                className="w-full p-2 border border-teal-500 bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white rounded-lg"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="izinEnd" className="block text-sm font-medium mb-1">Hingga</label>
              <input
                type="date"
                id="izinEnd"
                value={izinEnd}
                onChange={e => setIzinEnd(e.target.value)}
                className="w-full p-2 border border-teal-500 bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white rounded-lg"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="izinReason"
                className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1"
              >
                Alasan Izin
              </label>
              <textarea
                id="izinReason"
                value={izinReason}
                onChange={(e) => setIzinReason(e.target.value)}
                placeholder="Contoh: Sakit, urusan keluarga..."
                className="w-full p-3 border border-teal-500 bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none h-28 placeholder:text-gray-400 transition"
              />
            </div>

            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => {
                  setShowIzinForm(false);
                  setIzinReason('');
                  izinDataRef.current = null;
                }}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition"
              >
                Batal
              </button>
              <button
                onClick={handleIzinSubmit}
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
