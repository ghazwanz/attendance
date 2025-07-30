'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeCameraScanConfig } from 'html5-qrcode';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

const showToast = ({ type, message }: { type: 'success' | 'error' | 'info' | 'warning'; message: string }) => {
  const baseStyle = {
    borderRadius: '8px',
    padding: '10px 16px',
    fontWeight: 'bold',
  };

  const colorMap = {
    success: { background: '#16a34a', color: '#fff', icon: '✅' },
    error: { background: '#dc2626', color: '#fff', icon: '❌' },
    info: { background: '#2563eb', color: '#fff', icon: 'ℹ️' },
    warning: { background: '#eab308', color: '#000', icon: '⚠️' },
  };

  const { background, color, icon } = colorMap[type];
  toast(`${icon} ${message}`, { style: { ...baseStyle, background, color } });
};

type QRScannerProps = {
  onScanSuccess?: () => void;
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
  const [showIzinToHadirModal, setShowIzinToHadirModal] = useState(false);
  const [izinReason, setIzinReason] = useState('');
  const [balikLagi, setBalikLagi] = useState(false);
  const [isIzinPulang, setIsIzinPulang] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [izinStart, setIzinStart] = useState('');
  const [izinEnd, setIzinEnd] = useState('');
  const scanUserRef = useRef<{ user_id: string; name: string } | null>(null);

  const startScan = async () => {
    if (!scannerRef.current || isScanning) return;

    const html5QrCode = new Html5Qrcode(scannerRef.current.id);
    html5QrCodeRef.current = html5QrCode;

    const config: Html5QrcodeCameraScanConfig = {
      fps: 30,
      qrbox: { width: 250, height: 250 },
    };

    try {
      setHasScanned(false);
      await html5QrCode.start(
        { facingMode },
        config,
        async (decodedText) => {
          if (hasScanned) return;
          setHasScanned(true);


          toast.dismiss();
          toast.loading("⏳ Memproses scan...", { id: "scan-process" });

          try {
            const data = JSON.parse(decodedText);

            const { data: userData, error } = await supabase
              .from("users")
              .select("*")
              .eq("id", data.user_id)
              .single();
            console.log("User data:", userData, error);
            if (error || !userData) throw new Error("User tidak ditemukan");

            scanUserRef.current = {
              user_id: data.user_id,
              name: userData.name,
            };

            await stopScan()

            const today = new Date().toISOString().split("T")[0]; // hasil: "2025-07-26"

            const { data: attendanceToday } = await supabase
              .from("attendances")
              .select("*")
              .eq("user_id", userData.id)
              .eq("date", today)
              .limit(1)
              .single();
            console.log("Attendance today:", attendanceToday);
            toast.dismiss("scan-process");

            const { data: izinHariIni } = await supabase
              .from("permissions")
              .select("*")
              .eq("user_id", userData.id)
              .eq("date", today)
              .eq("status", "pending")
              .maybeSingle();
            if (attendanceToday) {
              if (
                attendanceToday.status === 'IZIN' &&
                !attendanceToday.check_in &&
                !attendanceToday.check_out
              ) {
                setShowIzinToHadirModal(true);
              } else if (attendanceToday.check_in && !attendanceToday.check_out) {
                setShowPulangModal(true);
              } else {
                showToast({
                  type: "info",
                  message: "Kamu sudah absen masuk dan pulang hari ini.",
                });
              }
            } else {
              if (izinHariIni) {
                setShowIzinToHadirModal(true);
              } else {
                setShowChoiceModal(true);
              }
            }

          } catch (err) {
            toast.dismiss("scan-process");
            setHasScanned(false); // allow re-scan
            showToast({
              type: "error",
              message: (err as Error).message,
            });
          }
        },
        (errorMessage) => {
          console.warn(errorMessage);
        }
      );

      setIsScanning(true);
    } catch (err) {
      showToast({ type: "error", message: "Gagal memulai kamera" });
    }
  };

  const stopScan = async () => {
    if (html5QrCodeRef.current) {
      await html5QrCodeRef.current.stop();
      await html5QrCodeRef.current.clear();
      html5QrCodeRef.current = null;
      setIsScanning(false);
      setHasScanned(false);
    }
  };

  const handleAbsenHadir = async () => {
    if (!scanUserRef.current) return;
    try {
      const { user_id, name } = scanUserRef.current;
      const nowDate = new Date();
      const now = nowDate.toISOString();

      // Ambil hari ini (misalnya 'Monday', 'Tuesday')
      const options = { weekday: 'long' } as const;
      const todayName = nowDate.toLocaleDateString('id-ID', options).toLowerCase(); // misalnya: 'Monday'

      // Ambil jadwal hari ini dari tabel schedules
      const { data: jadwalHariIni, error: jadwalError } = await supabase
        .from('schedules')
        .select('start_time')
        .eq('day', todayName)
        .single();

      if (jadwalError || !jadwalHariIni) {
        throw new Error(`Jadwal hari ${todayName} tidak ditemukan`);
      }

      const [jamJadwal, menitJadwal] = jadwalHariIni.start_time.split(':').map(Number);

      // Konversi ke waktu lokal
      const local = new Date(nowDate.getTime() - nowDate.getTimezoneOffset() * 60000);
      const jamNow = local.getHours();
      const menitNow = local.getMinutes();

      let status = 'HADIR';
      if (jamNow > jamJadwal || (jamNow === jamJadwal && menitNow > menitJadwal)) {
        status = 'TERLAMBAT';
      }

      const today = local.toISOString().split('T')[0];

      // Cek kehadiran hari ini
      const { data: existing } = await supabase
        .from('attendances')
        .select('id, check_in, status')
        .eq('user_id', user_id)
        .eq('date', today)
        .limit(1)
        .single();

      if (existing && existing.id) {
        let updateStatus = status;
        if (existing.status === 'TERLAMBAT' || updateStatus === 'TERLAMBAT') {
          updateStatus = 'TERLAMBAT';
        }

        const { error } = await supabase
          .from('attendances')
          .update({
            check_in: now,
            status: updateStatus,
          })
          .eq('id', existing.id);

        if (error) throw new Error('Gagal update kehadiran');
      } else {
        const { error } = await supabase.from('attendances').insert({
          user_id,
          date: today,
          check_in: now,
          check_out: null,
          notes: '',
          created_at: now,
          status,
        });

        if (error) throw new Error('Gagal menyimpan kehadiran');
      }

      showToast({ type: 'success', message: `Berhasil hadir (${status}) untuk ${name}` });
      if (onScanSuccess) onScanSuccess();
    } catch (err) {
      showToast({ type: 'error', message: (err as Error).message });
    } finally {
      setShowChoiceModal(false);
    }
  };


  const handleAbsenIzin = () => {
    setIsIzinPulang(false);
    setShowChoiceModal(false);
    setShowIzinForm(true);
    // Set default tanggal izin ke hari ini setiap buka form
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    setIzinStart(todayStr);
    setIzinEnd(todayStr);
  };

  const handleSubmitIzin = async () => {
    if (!izinReason.trim() || !scanUserRef.current || !izinStart || !izinEnd) {
      showToast({ type: 'error', message: 'Mohon isi tanggal mulai, hingga, dan alasan izin' });
      return;
    }
    // Validasi tanggal tidak boleh kemarin dan hingga >= mulai
    const today = new Date();
    const minDate = today.toISOString().split('T')[0];
    if (izinStart < minDate) {
      showToast({ type: 'error', message: 'Izin tidak bisa untuk hari kemarin.' });
      return;
    }
    if (izinEnd < izinStart) {
      showToast({ type: 'error', message: 'Tanggal hingga tidak boleh sebelum tanggal mulai' });
      return;
    }
    try {
      const { user_id, name } = scanUserRef.current;
      const now = new Date().toISOString();
      // Insert ke tabel permissions, field exit_time dan reentry_time
      const { error } = await supabase.from('permissions').insert({
        user_id,
        reason: izinReason,
        created_at: now,
        exit_time: izinStart,
        reentry_time: izinEnd,
        date: izinStart,
        status: 'pending',
      });
      if (error) throw new Error('Gagal menyimpan izin');
      showToast({ type: 'warning', message: `Izin berhasil untuk ${name}` });
      if (onScanSuccess) onScanSuccess();
    } catch (err) {
      showToast({ type: 'error', message: (err as Error).message });
    } finally {
      setIzinReason('');
      setIzinStart('');
      setIzinEnd('');
      setShowIzinForm(false);
      setIsIzinPulang(false);
    }
  };

  const handlePulang = async () => {
    if (!scanUserRef.current) return;

    try {
      const { user_id, name } = scanUserRef.current;
      const now = new Date();
      const today = now.toISOString().split('T')[0];

      const { data: attendanceToday, error: fetchError } = await supabase
        .from('attendances')
        .select('*')
        .eq('user_id', user_id)
        .eq('date', today)
        .single();

      if (fetchError || !attendanceToday) {
        throw new Error('Data kehadiran tidak ditemukan');
      }

      const checkInTime = new Date(attendanceToday.check_in);
      const hoursDiff = (now.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

      if (hoursDiff < 8) {
        showToast({
          type: 'warning',
          message: `Belum bisa pulang. Baru ${hoursDiff.toFixed(1)} jam, minimal 8 jam.`,
        });
        return;
      }

      const { error: updateError } = await supabase
        .from('attendances')
        .update({ check_out: now.toISOString() })
        .eq('user_id', user_id)
        .eq('date', today);

      if (updateError) throw new Error('Gagal mencatat pulang');

      showToast({ type: 'info', message: `Pulang dicatat untuk ${name}` });
      if (onScanSuccess) onScanSuccess();
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
      const today = now.split('T')[0];

      // 1. Insert ke tabel permissions
      const { error: izinError } = await supabase.from('permissions').insert({
        user_id,
        reason: izinReason,
        created_at: now,
        exit_time: now,
        reentry_time: null,
        date: today,
        status: 'pending',
      });

      if (izinError) throw new Error('Gagal menyimpan izin pulang ke permissions');

      showToast({ type: 'info', message: `Izin keluar berhasil untuk ${name}` });
      if (onScanSuccess) {
        onScanSuccess();
      }
    } catch (err) {
      showToast({ type: 'error', message: (err as Error).message });
    } finally {
      setIzinReason('');
      setBalikLagi(false);
      setShowPulangModal(false);
      setShowIzinForm(false);
      setIsIzinPulang(false);
    }
  };


  return (
    <div className="p-6 max-w-lg mx-auto rounded-2xl shadow-2xl bg-white text-gray-900 dark:bg-[#1c2431] dark:text-white">
      {/* Kamera Select */}
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

      {/* Scanner Box */}
      <div
        id="reader"
        ref={scannerRef}
        className="rounded-xl border border-dashed border-teal-400 p-4 bg-gray-100 dark:bg-gray-800 text-center"
        style={{ minHeight: 200 }}
      >
        <p className="text-gray-600 dark:text-gray-300">Izinkan kamera dan arahkan QR</p>
      </div>

      {/* Tombol */}
      <div className="flex justify-center mt-4 space-x-4">
        <button onClick={startScan} disabled={isScanning} className="px-4 py-2 bg-green-600 text-white rounded-lg">
          Mulai
        </button>
        <button onClick={stopScan} disabled={!isScanning} className="px-4 py-2 bg-red-600 text-white rounded-lg">
          Stop
        </button>
      </div>

      {/* Modal Pilih Hadir / Izin */}
      {showChoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-sm shadow-xl text-gray-900 dark:text-white">
            <h2 className="text-lg font-semibold mb-4 text-center">Pilih Kehadiran</h2>
            <div className="flex flex-col gap-3">
              <button onClick={handleAbsenHadir} className="w-full px-4 py-2 bg-green-600 text-white rounded-md">✅ Hadir</button>
              <button onClick={handleAbsenIzin} className="w-full px-4 py-2 bg-yellow-500 text-white rounded-md">📝 Izin Tidak Hadir</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ubah dari Izin ke Hadir */}
      {showIzinToHadirModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-sm shadow-xl text-gray-900 dark:text-white">
            <h2 className="text-lg font-semibold mb-4 text-center">Ubah Kehadiran</h2>
            <p className="text-sm text-center mb-4">
              Kamu sebelumnya mengajukan izin. Apakah sekarang ingin mengganti menjadi HADIR?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setShowIzinToHadirModal(false);
                  handleAbsenHadir(); // langsung ubah jadi hadir
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md"
              >
                ✅ Hadir
              </button>
              {showIzinToHadirModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-sm shadow-xl text-gray-900 dark:text-white">
                    <h2 className="text-lg font-semibold mb-4 text-center">Ubah Kehadiran</h2>
                    <p className="text-sm text-center mb-4">
                      Kamu sebelumnya mengajukan izin. Apakah sekarang ingin mengganti menjadi HADIR?
                    </p>
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={async () => {
                          setShowIzinToHadirModal(false);

                          if (scanUserRef.current) {
                            const today = new Date().toISOString().split("T")[0];

                            // Hapus izin pending hari ini
                            await supabase
                              .from("permissions")
                              .delete()
                              .eq("user_id", scanUserRef.current.user_id)
                              .eq("date", today)
                              .eq("status", "pending");
                          }

                          handleAbsenHadir(); // lanjutkan absen hadir
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-md"
                      >
                        ✅ Hadir
                      </button>
                      <button
                        onClick={() => setShowIzinToHadirModal(false)}
                        className="px-4 py-2 bg-gray-400 text-white rounded-md"
                      >
                        ❌ Batal
                      </button>
                    </div>
                  </div>
                </div>
              )}


            </div>
          </div>
        </div>
      )}


      {/* Modal Pulang / Izin Pulang */}
      {showPulangModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-sm shadow-xl text-gray-900 dark:text-white">
            <h2 className="text-lg font-semibold mb-4 text-center">Sudah Hadir</h2>
            <div className="flex flex-col gap-3">
              <button onClick={handlePulang} className="w-full px-4 py-2 bg-blue-600 text-white rounded-md">🏁 Pulang</button>
              <button
                onClick={() => {
                  setShowPulangModal(false);
                  setIsIzinPulang(true);
                  setShowIzinForm(true);
                }}
                className="w-full px-4 py-2 bg-orange-500 text-white rounded-md"
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
              {isIzinPulang ? 'Silakan isi alasan izin pulang awal Anda.' : 'Silakan isi tanggal mulai, hingga, dan alasan tidak hadir Anda.'}
            </p>

            {!isIzinPulang && (
              <>
                <div className="mb-4">
                  <label htmlFor="izinStart" className="block text-sm font-medium mb-1">Mulai Izin</label>
                  <input
                    type="date"
                    id="izinStart"
                    value={izinStart}
                    min={(() => {
                      const today = new Date();
                      return today.toISOString().split('T')[0];
                    })()}
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
                    min={izinStart || (() => {
                      const today = new Date();
                      return today.toISOString().split('T')[0];
                    })()}
                    onChange={e => setIzinEnd(e.target.value)}
                    className="w-full p-2 border border-teal-500 bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white rounded-lg"
                  />
                </div>
              </>
            )}
            <div className="mb-4">
              <label htmlFor="izinReason" className="block text-sm font-medium mb-1">Alasan</label>
              <textarea
                id="izinReason"
                value={izinReason}
                onChange={(e) => setIzinReason(e.target.value)}
                className="w-full p-3 border border-teal-500 bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white rounded-lg resize-none h-28"
              />
            </div>

            {isIzinPulang && (
              <div className="mb-4 flex items-center">
                <input id="balikLagi" type="checkbox" checked={balikLagi} onChange={(e) => setBalikLagi(e.target.checked)} className="mr-2" />
                <label htmlFor="balikLagi" className="text-sm">Saya akan kembali ke kantor</label>
              </div>
            )}

            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => {
                  setShowIzinForm(false);
                  setIzinReason('');
                  setIzinStart('');
                  setIzinEnd('');
                  setBalikLagi(false);
                  setIsIzinPulang(false);
                }}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded-md"
              >
                Batal
              </button>
              <button
                onClick={isIzinPulang ? handleIzinPulang : handleSubmitIzin}
                className="px-4 py-2 bg-teal-600 text-white rounded-md"
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
