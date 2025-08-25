"use client";
import { useEffect, useRef, useState } from "react";
import { Camera, Upload, CheckCircle, X } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import UploadCard from "./QRUpload";
import CameraScanner from "./QRCamera";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { QRScannerProps } from '@/lib/type';
import { handleAbsenHadir } from '@/app/scan/actions/AbsensiMasukAction';
import ClockInModal from '@/app/scan/components/ModalAbsensi';
import getMessage from '@/app/scan/actions/getMessage';
import getPiket from '@/app/scan/actions/getPiket';
import ReminderModal from '@/app/scan/components/ReminderModal';
import { handlePulangAction } from '@/app/scan/actions/AbsensiPulangAction';
import { showToast } from "@/lib/utils/toast";
import { useLocationStores } from "@/lib/stores/useLocationStores";
import { UseUserLocationEffect } from "@/lib/utils/getUserLocation";
import { fetchExternalTime, parseTimeData } from "@/app/scan/lib/utils";

export type NotificationProps = {
    title: string,
    message: string,
    type: "piket_reminder" | "piket_out_reminder" | "clock_out_reminder"
} | null

export default function QRWrapperFile({ className }: { className?: string }) {
    // useUserLocationEffect()
    const [qrData, setQrData] = useState<string | null>(null)
    const [isScanning, setIsScanning] = useState(false);
    const [scanMode, setScanMode] = useState<"upload" | "camera">("upload");
    const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
    const supabase = createClient();
    const scanUserRef = useRef<{ user_id: string; name: string } | null>(null);
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
    const [pending, setPending] = useState(false)
    const [disabled, setDisabled] = useState(false)
    const isOutside = useLocationStores(state => state.isOutside)
    const [notifData, setNotifData] = useState<NotificationProps>({ title: "", message: "", type: "clock_out_reminder" })

    // html5QrCodeRef.current = new Html5Qrcode("qr-reader");
    // --- HANDLE SUCCESS (rapi dari qrscan.tsx)
    const handleScanSuccess = async (decodedText: string) => {
        try {
            const data = JSON.parse(decodedText);

            showToast({type:"warning",message:"Memproses QR..."})
            // 🔍 cek user
            const { data: userData, error } = await supabase
                .from("users")
                .select("*")
                .eq("id", data.user_id)
                .single();

            if (error || !userData) throw new Error("User tidak ditemukan");
            setQrData(`Berhasil Memproses QR.`);
            scanUserRef.current = { user_id: data.user_id, name: userData.name };

            const todayExt = await fetchExternalTime()
            const today = parseTimeData(todayExt)
            console.log(today, todayExt)

            // 🔍 cek absen hari ini
            const { data: attendanceToday, error:attendanceError } = await supabase
                .from("attendances")
                .select("*")
                .eq("user_id", userData.id)
                .eq("date", today.dateString)
                .maybeSingle();

            // 🔍 cek izin hari ini
            const { data: izinHariIni } = await supabase
                .from("permissions")
                .select("*")
                .eq("user_id", userData.id)
                .eq("status", "pending")
                .eq("date", today.dateString)
                .maybeSingle();

            if (attendanceError) throw new Error("Gagal Memproses QR")
            // === logika ===
            if (attendanceToday) {
                // kalau hari ini statusnya izin & belum absen → tawarkan ubah ke Hadir
                if (
                    attendanceToday.status === "IZIN" &&
                    !attendanceToday.check_in &&
                    !attendanceToday.check_out
                ) {
                    setShowIzinToHadirModal(true);
                }
                // kalau sudah masuk tapi belum pulang → tampilkan modal Pulang / Izin Pulang
                else if (attendanceToday.check_in && !attendanceToday.check_out) {
                    const { data: izinPulang } = await supabase
                        .from("permissions")
                        .select("*")
                        .eq("user_id", userData.id)
                        .eq("status", "pending")
                        .eq("date", today.dateString)
                        .not("exit_time", "is", null)
                        .is("reentry_time", null)
                        .maybeSingle();

                    setSudahIzinPulang(!!izinPulang);

                    if (izinPulang && izinPulang.exit_time && !izinPulang.reentry_time) {
                        // sudah izin keluar tapi belum balik
                        setShowIzinReturnModal(true);
                    } else {
                        setShowPulangModal(true);
                    }
                }
                // kalau sudah pulang → tawarkan izin besok
                else {
                    setShowChoiceBesokModal(true);
                }
            } else {
                // kalau hari ini sudah ada izin → tawarkan ubah ke Hadir
                if (izinHariIni) {
                    setShowIzinToHadirModal(true);
                } else {
                    // kalau belum ada → tampilkan pilihan Hadir / Izin
                    setShowChoiceModal(true);
                }
            }
        } catch (err: any) {
            toast.error(err.message || "Gagal membaca QR");
            setQrData(err.message || "Gagal membaca QR");
        } finally{
            toast.dismiss()
        }
    };

    const startCameraScan = async () => {
        await html5QrCodeRef.current?.clear();
        html5QrCodeRef.current = new Html5Qrcode("qr-reader");
        if (!html5QrCodeRef.current) return;
        setIsScanning(true);
        setScanMode("camera");

        // 🔑 Pastikan render sudah jalan
        setTimeout(async () => {
            try {
                await html5QrCodeRef.current!.start(
                    { facingMode: "environment" },
                    { fps: 30, qrbox: { width: 250, height: 250 } },
                    async (decodedText) => {
                        setQrData("Memproses QR code...");
                        setIsScanning(false);
                        await html5QrCodeRef.current?.stop();
                        handleScanSuccess(decodedText);
                    },
                    (err: any) => {
                        console.log(err.message)
                    }
                );
            } catch (err: any) {
                setIsScanning(false);
            }
        }, 100); // beri jeda 100ms agar <div id="qr-reader"> siap
    };


    const stopCameraScan = async () => {
        try {
            await html5QrCodeRef.current?.stop();
            setIsScanning(false);
            // setScanMode("upload");
        } catch (err) {
            console.error("Error stopping camera:", err);
        }
    };

    const handleFileSelect = async (file: File) => {
        html5QrCodeRef.current?.clear();
        html5QrCodeRef.current = new Html5Qrcode("qr-reader");
        if (!file || !html5QrCodeRef.current) return;
        try {
            setIsScanning(true);
            const result = await html5QrCodeRef.current.scanFile(file, true);
            setQrData("Memproses QR code...");
            handleScanSuccess(result);
        } catch (err: any) {
            showToast({ type: 'error', message: err.message || 'Gagal membaca QR' });
            setQrData("Gagal membaca QR");
        } finally {
            await html5QrCodeRef.current?.clear();
            setIsScanning(false);
        }
    };

    const resetScanner = async () => {
        // setScanMode("upload");
        await html5QrCodeRef.current?.clear();
        setQrData(null)
    };
    const handleHadirSelection = async () => {
        if (!scanUserRef.current) return;
        toast.dismiss()
        try {
            setDisabled(prev => !prev);
            setPending(prev => !prev);

            const { status, message } = await handleAbsenHadir(scanUserRef.current, isOutside);

            if (status === "error") throw new Error(message)
            showToast({ type: "success", message: message });

            setShowChoiceModal(false);

            const isPiket = await getPiket({ user_id: scanUserRef.current.user_id })
            const type = isPiket ? "piket_reminder" : null
            if (!type) return
            const msg = await getMessage(type)
            if (msg) {
                setNotifData({ title: msg?.title, message: msg?.message, type })
                setNotifOpen((prev) => !prev)
            }
        } catch (error: any) {
            showToast({ type: 'info', message: error.message });
        } finally {
            setDisabled(prev => !prev);
            setPending(prev => !prev);
        }
    }
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
    // Handler Pulang: setelah klik pulang, tampilkan form keterangan
    const [showKeteranganPulangModal, setShowKeteranganPulangModal] = useState(false);
    const [keteranganPulang, setKeteranganPulang] = useState("");
    // Handler Pulang: setelah klik pulang, cek 8 jam dan tampilkan notifikasi konfirmasi
    const handlePulang = async () => {
        if (!scanUserRef.current) return;
        toast.dismiss()

        if (isOutside) return showToast({ type: 'error', message: 'Anda berada di luar area kantor' });

        setNotifData({
            title: 'Konfirmasi Pulang',
            message: 'Apakah Anda yakin ingin pulang sekarang?',
            type: 'clock_out_reminder',
        });
        setNotifOpen(true);
        setShowPulangModal(false);
    };

    // Handler submit keterangan pulang
    const handleConfirmPulang = async () => {
        if (!scanUserRef.current) return;
        const { user_id, name } = scanUserRef.current
        toast.dismiss()

        try {
            if (!keteranganPulang.trim())
                throw new Error('Keterangan kegiatan hari ini wajib diisi.');

            await handlePulangAction({ user_id, name, notes: keteranganPulang }, isOutside)
            showToast({ type: 'info', message: `Pulang dicatat untuk ${name}` });
            setShowKeteranganPulangModal(false);
            setNotifOpen(false)
        } catch (error: any) {
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
    const handleSubmitIzin = async () => {
        toast.dismiss()
        if (!izinReason.trim() || !scanUserRef.current || !izinStart || !izinEnd) {
            showToast({ type: 'error', message: 'Mohon isi tanggal mulai, hingga, dan alasan izin' });
            return;
        }
        // Validasi tanggal tidak boleh kemarin dan hingga >= mulai
        const today = await fetchExternalTime();
        const {dateString,date} = parseTimeData(today);
        console.log(dateString)
        if (izinStart < dateString) {
            showToast({ type: 'error', message: 'Izin tidak bisa untuk hari kemarin.' });
            return;
        }
        if (izinEnd < izinStart) {
            showToast({ type: 'error', message: 'Tanggal hingga tidak boleh sebelum tanggal mulai' });
            return;
        }
        try {
            const { user_id, name } = scanUserRef.current;
            // Insert ke tabel permissions, field exit_time dan reentry_time
            const { error } = await supabase.from('permissions').insert({
                user_id,
                reason: izinReason,
                created_at: date.toISOString(),
                exit_time: izinStart,
                reentry_time: izinEnd,
                date: dateString,
                status: 'pending',
            });
            if (error) throw new Error('Gagal menyimpan izin');
            showToast({ type: 'warning', message: `Izin berhasil untuk ${name}` });
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

    return (
        <>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 w-full transition-colors">
                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                        Upload QR CODE Kamu!
                    </h2>

                </div>

                {/* Upload or Camera */}
                {scanMode === "upload" && (
                    <UploadCard onFileSelect={handleFileSelect} disabled={isScanning} />
                )}
                {scanMode === "camera" && <CameraScanner isScanning={isScanning} onStop={stopCameraScan} />}

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={() => setScanMode("upload")}
                        disabled={isScanning}
                        className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                    >
                        <Upload size={16} />
                        Upload QR
                    </button>
                    <button
                        onClick={startCameraScan}
                        disabled={isScanning}
                        className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                    >
                        <Camera size={16} />
                        Scan Camera
                    </button>
                </div>

                {/* Loading */}
                {isScanning && scanMode === "upload" && (
                    <div className="mt-4 text-center text-blue-600 flex justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        Processing QR code...
                    </div>
                )}

                {/* Hidden div untuk camera init */}
                {scanMode !== "camera" && <div id="qr-reader" className="hidden" />}

                {qrData && (
                    <div className="py-2 px-3 mt-4 w-full relative bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-200">
                        <p>{qrData}</p>
                        {/* <p>message test</p> */}
                        <button onClick={resetScanner} className="absolute right-1 top-3"> <X size={16} /> </button>
                    </div>
                )}

                {/* Footer */}
                <div className="text-center mt-6 text-xs text-gray-400">
                    Powered by html5-qrcode
                </div>
            </div>
            {/* Modal Pilih Hadir / Izin */}
            <ClockInModal
                isOpen={showChoiceModal}
                onClose={() => setShowChoiceModal(false)}
                onSelectHadir={handleHadirSelection}
                onSelectIzin={handleAbsenIzin}
                pending={pending}
                disabled={disabled}
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
                                                        const extToday = await fetchExternalTime()
                                                        const {dateString} = parseTimeData(extToday);

                                                        // Hapus izin pending hari ini
                                                        await supabase
                                                            .from("permissions")
                                                            .delete()
                                                            .eq("user_id", scanUserRef.current.user_id)
                                                            .eq("date", dateString)
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
                        <button
                            onClick={() => setShowPulangModal(false)}
                            className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-xl font-bold"
                            aria-label="Tutup"
                        >
                            &times;
                        </button>
                        <h2 className="text-lg font-semibold mb-2 text-center">Sudah Hadir</h2>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handlePulang}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md"
                            >
                                🏁 Pulang
                            </button>
                            {/* <button
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
                            </button> */}
                            <button
                                onClick={() => {
                                    const besok = new Date();
                                    besok.setDate(besok.getDate() + 1);
                                    const besokStr = besok.toLocaleDateString('sv');
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

            {/* Modal Keterangan Pulang */}
            {showKeteranganPulangModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-sm shadow-xl text-gray-900 dark:text-white">
                        <h2 className="text-lg font-semibold mb-4 text-center">Keterangan Kegiatan Hari Ini</h2>
                        <textarea
                            className="w-full p-3 border border-teal-500 bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white rounded-lg resize-none h-28 mb-4"
                            placeholder="Tuliskan kegiatan utama hari ini..."
                            value={keteranganPulang}
                            onChange={e => setKeteranganPulang(e.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowKeteranganPulangModal(false)}
                                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded-md"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleConfirmPulang}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md"
                            >
                                Simpan & Pulang
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
                                            console.log(today.toLocaleDateString('sv'))
                                            return today.toLocaleDateString('sv');
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
                                            return today.toLocaleDateString('sv');
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

            {/* Notifikasi konfirmasi clock out */}
            <ReminderModal
                title={notifData?.title}
                message={notifData?.message || ""}
                isOpen={notifOpen}
                onConfirm={async () => {
                    // Cek minimal 8 jam di sini
                    setNotifOpen(false);
                    setShowKeteranganPulangModal(true);
                }}
                onClose={() => setNotifOpen(false)}
                type={notifData?.type || ""}
            />
        </>
    );
}
