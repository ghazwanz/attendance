'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeCameraScanConfig } from 'html5-qrcode';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { QRScannerProps } from '@/lib/type';
import { handleAbsenHadir } from './actions/AbsensiMasukAction';
import ClockInModal from './components/ModalAbsensi';
import getMessage from './actions/getMessage';
import getPiket from './actions/getPiket';
import ReminderModal from './components/ReminderModal';
import { handlePulangAction } from './actions/AbsensiPulangAction';

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

export default function QRScanner({ onScanSuccess, onScanError, isOutside }: QRScannerProps) {
  const supabase = createClient();
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isScanning, setIsScanning] = useState(false);
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [showIzinForm, setShowIzinForm] = useState(false);
  const [showPulangModal, setShowPulangModal] = useState(false);
  const [showIzinToHadirModal, setShowIzinToHadirModal] = useState(false);
  const [showIzinReturnModal, setShowIzinReturnModal] = useState(false);
  const [izinReason, setIzinReason] = useState('');
  const [balikLagi, setBalikLagi] = useState(false);
  const [isIzinPulang, setIsIzinPulang] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [izinStart, setIzinStart] = useState('');
  const [izinEnd, setIzinEnd] = useState('');
  const [sudahIzinPulang, setSudahIzinPulang] = useState(false);
  const [showChoiceBesokModal, setShowChoiceBesokModal] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifData, setNotifData] = useState<{ title: string, message: string, type: "piket_reminder" | "piket_out_reminder" | "clock_out_reminder" } | null>({ title: "", message: "", type: "clock_out_reminder" })

  const scanUserRef = useRef<{ user_id: string; name: string } | null>(null);

  const startScan = async () => {
    if (!scannerRef.current || isScanning) return;

    setIsScanning(true); // ⛔ Lock scanning SEBELUM proses apapun dimulai
    scannerRef.current.innerHTML = ''; // Bersihkan elemen scanner
    await stopScan(); // Pastikan scanner lama dihentikan

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

          await stopScan();
          try {
            const data = JSON.parse(decodedText);

            const { data: userData, error } = await supabase
              .from("users")
              .select("*")
              .eq("id", data.user_id)
              .single();

            if (error || !userData) throw new Error("User tidak ditemukan");

            scanUserRef.current = {
              user_id: data.user_id,
              name: userData.name,
            };

            const today = new Date().toISOString().split("T")[0];

            const { data: attendanceToday } = await supabase
              .from("attendances")
              .select("*")
              .eq("user_id", userData.id)
              .eq("date", today)
              .limit(1)
              .single();

            toast.dismiss("scan-process");

            const { data: izinHariIni } = await supabase
              .from("permissions")
              .select("*")
              .eq("user_id", userData.id)
              .eq("status", "pending")
              .eq("date", today) // ✅ Hanya ambil izin untuk hari ini
              .maybeSingle();

            if (attendanceToday) {
              if (
                attendanceToday.status === 'IZIN' &&
                !attendanceToday.check_in &&
                !attendanceToday.check_out
              ) {
                setShowIzinToHadirModal(true);
              } else if (attendanceToday.check_in && !attendanceToday.check_out) {
                const { data: izinPulang } = await supabase
                  .from("permissions")
                  .select("*")
                  .eq("user_id", userData.id)
                  .eq("status", "pending")
                  .eq("date", today)
                  .not("exit_time", "is", null)
                  .is("reentry_time", null)
                  .maybeSingle();

                setSudahIzinPulang(!!izinPulang);
                if (izinPulang && izinPulang.exit_time && !izinPulang.reentry_time) {
                  // User keluar tapi belum kembali
                  setShowPulangModal(false);
                  setShowIzinReturnModal(true); // modal baru yang akan kamu buat
                  return;
                }

                setShowPulangModal(true);
              } else {
                // Cek apakah sudah punya izin untuk besok
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                const tomorrowStr = tomorrow.toISOString().split("T")[0];

                const { data: izinBesok } = await supabase
                  .from("permissions")
                  .select("*")
                  .eq("user_id", userData.id)
                  .eq("date", tomorrowStr)
                  .maybeSingle();

                if (!izinBesok) {
                  toast.dismiss("scan-process");
                  showToast({
                    type: "info",
                    message: "Hari ini Anda sudah pulang. Apakah ingin izin untuk besok?"
                  });
                  setShowChoiceBesokModal(true); // <- modal baru
                } else {
                  toast.dismiss("izin-besok"); // pastikan hanya muncul satu
                  showToast({
                    type: "info",
                    message: "Hari ini Anda sudah pulang. Apakah ingin izin untuk besok?"
                  });

                }
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
            setHasScanned(false);
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

  const handleHadirSelection = async () => {
    if (!scanUserRef.current) return;
    const success = await handleAbsenHadir(scanUserRef.current, isOutside, showToast);
    if (success && onScanSuccess) {
      onScanSuccess();
      setShowChoiceModal(false);
      const isPiket = await getPiket({ user_id: scanUserRef.current.user_id })
      const type = isPiket ? "piket_reminder" : null
      if (!type) return
      const msg = await getMessage(type)
      if (msg) {
        setNotifData({ title: msg?.title, message: msg?.message, type })
        setNotifOpen((prev) => !prev)
      }
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
    if (isOutside) return showToast({ type: 'error', message: 'Anda berada di luar area kantor' });
    const { user_id } = scanUserRef.current
    const isPiket = await getPiket({ user_id })
    const type = isPiket ? "piket_out_reminder" : "clock_out_reminder"
    const msg = await getMessage(type)
    console.log(msg)
    if (msg) {
      setNotifData({ title: msg?.title, message: msg?.message, type })
      setShowPulangModal((prev)=>!prev);
      setNotifOpen((prev) => !prev)
    }
  };

  const handleConfirmPulang = async () => {
    if (!scanUserRef.current) return;
    const { user_id, name }  = scanUserRef.current

    try {
      await handlePulangAction({user_id,name},isOutside)
      showToast({ type: 'info', message: `Pulang dicatat untuk ${name}` });
      setNotifOpen((prev) => !prev)
    } catch (error : any) {
      showToast({ type: 'info', message: error.message });
    }

  }

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
      <ClockInModal
        isOpen={showChoiceModal}
        onClose={() => setShowChoiceModal(false)}
        onSelectHadir={handleHadirSelection}
        onSelectIzin={handleAbsenIzin}
      />
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
                  handleHadirSelection(); // langsung ubah jadi hadir
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
                          handleHadirSelection(); // lanjutkan absen hadir
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
          <div className="relative bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-sm shadow-xl text-gray-900 dark:text-white">

            {/* Tombol silang di pojok kanan atas */}
            <button
              onClick={() => setShowPulangModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-xl font-bold"
              aria-label="Tutup"
            >
              &times;
            </button>

            <h2 className="text-lg font-semibold mb-2 text-center">Sudah Hadir</h2>

            {/* Deskripsi warna kuning */}
            <p className="text-sm text-yellow-500 text-center mb-4">
              Belum bisa pulang sebelum 8 jam.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={handlePulang}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                🏁 Pulang
              </button>

              <button
                onClick={() => {
                  if (!sudahIzinPulang) {
                    setShowPulangModal(false);
                    setIsIzinPulang(true);
                    setShowIzinForm(true);
                  }
                }}
                disabled={sudahIzinPulang}
                className={`w-full px-4 py-2 text-white rounded-md ${sudahIzinPulang ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500'
                  }`}
              >
                🚪 Izin Pulang Awal
              </button>

              <button
                onClick={() => {
                  const besok = new Date();
                  besok.setDate(besok.getDate() + 1);
                  const besokStr = besok.toISOString().split('T')[0];

                  setIzinStart(besokStr);
                  setIzinEnd(besokStr);
                  setIsIzinPulang(false);
                  setShowPulangModal(false);
                  setShowIzinForm(true);
                }}
                className="w-full px-4 py-2 bg-teal-600 text-white rounded-md"
              >
                📅 Izin Besok
              </button>

              {sudahIzinPulang && (
                <p className="text-xs text-center text-red-500 mt-1">
                  Anda sudah izin pulang awal hari ini.
                </p>
              )}
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
      {showIzinReturnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-sm shadow-xl text-gray-900 dark:text-white">
            <h2 className="text-lg font-semibold mb-4 text-center">Konfirmasi Kembali</h2>
            <p className="text-sm text-center mb-4">
              Kamu sebelumnya izin pulang awal. Apakah kamu sudah kembali ke kantor sekarang?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={async () => {
                  setShowIzinReturnModal(false);
                  const now = new Date().toISOString();
                  const today = new Date().toISOString().split("T")[0];

                  if (scanUserRef.current) {
                    const { error } = await supabase
                      .from("permissions")
                      .update({ reentry_time: now })
                      .eq("user_id", scanUserRef.current.user_id)
                      .eq("date", today)
                      .eq("status", "pending")
                      .not("exit_time", "is", null)
                      .is("reentry_time", null);

                    if (error) {
                      showToast({ type: "error", message: "Gagal mencatat kembali" });
                    } else {
                      showToast({ type: "success", message: "Kamu berhasil kembali ke kantor" });
                      if (onScanSuccess) onScanSuccess();
                    }
                  }
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md"
              >
                ✅ Sudah Kembali
              </button>
              <button
                onClick={() => setShowIzinReturnModal(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded-md"
              >
                ❌ Batal
              </button>
            </div>
          </div>
        </div>
      )}
      {showChoiceBesokModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-sm shadow-xl text-gray-900 dark:text-white">
            <h2 className="text-lg font-semibold mb-4 text-center">Ajukan Izin Besok</h2>
            <p className="text-sm text-center mb-4">
              Anda sudah pulang hari ini. Ingin mengajukan izin untuk <b>besok</b>?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  const besokStr = tomorrow.toISOString().split("T")[0];

                  setShowChoiceBesokModal(false);
                  setIsIzinPulang(false);
                  setShowIzinForm(true);
                  setIzinStart(besokStr);
                  setIzinEnd(besokStr);
                }}
                className="px-4 py-2 bg-yellow-500 text-white rounded-md"
              >
                📝 Izin Tidak Hadir Besok
              </button>
              <button
                onClick={() => setShowChoiceBesokModal(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded-md"
              >
                ❌ Batal
              </button>
            </div>
          </div>
        </div>
      )}

      <ReminderModal
        title={notifData?.title}
        message={notifData?.message || ""}
        isOpen={notifOpen}
        onConfirm={handleConfirmPulang}
        onClose={() => setNotifOpen((prev) => !prev)}
        type={notifData?.type || ""}
      />

    </div>
  );
}
