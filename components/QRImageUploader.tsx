"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Upload, X } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { handleAbsenHadir } from "@/app/scan/actions/AbsensiMasukAction";
import getPiket from "@/app/scan/actions/getPiket";
import getMessage from "@/app/scan/actions/getMessage";
import { handlePulangAction } from "@/app/scan/actions/AbsensiPulangAction";
import ClockInModal from "@/app/scan/components/ModalAbsensi";
import ReminderModal from "@/app/scan/components/ReminderModal";


export default function QRImageUploader() {
  const supabase = createClient();
  const [isScanning, setIsScanning] = useState(false);
  const [scanMode, setScanMode] = useState<"upload" | "camera">("upload");
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- state modal & logika sama kayak qrscan.tsx ---
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [showPulangModal, setShowPulangModal] = useState(false);
  const [showIzinForm, setShowIzinForm] = useState(false);
  const [showIzinToHadirModal, setShowIzinToHadirModal] = useState(false);
  const [showChoiceBesokModal, setShowChoiceBesokModal] = useState(false);
  const [showKeteranganPulangModal, setShowKeteranganPulangModal] = useState(false);

  const [izinReason, setIzinReason] = useState("");
  const [izinStart, setIzinStart] = useState("");
  const [izinEnd, setIzinEnd] = useState("");
  const [keteranganPulang, setKeteranganPulang] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifData, setNotifData] = useState<any>(null);

  const scanUserRef = useRef<{ user_id: string; name: string } | null>(null);

  useEffect(() => {
    if (!html5QrCodeRef.current) {
      html5QrCodeRef.current = new Html5Qrcode("qr-reader");
    }
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  // === CORE: aksi setelah QR berhasil dibaca (upload / camera) ===
  const handleScanResult = async (decodedText: string) => {
    try {
      const data = JSON.parse(decodedText);

      const { data: userData, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user_id)
        .single();

      if (error || !userData) throw new Error("User tidak ditemukan");

      scanUserRef.current = { user_id: data.user_id, name: userData.name };

      const today = new Date().toISOString().split("T")[0];

      const { data: attendanceToday } = await supabase
        .from("attendances")
        .select("*")
        .eq("user_id", userData.id)
        .eq("date", today)
        .maybeSingle();

      const { data: izinHariIni } = await supabase
        .from("permissions")
        .select("*")
        .eq("user_id", userData.id)
        .eq("status", "pending")
        .eq("date", today)
        .maybeSingle();

      if (attendanceToday) {
        if (
          attendanceToday.status === "IZIN" &&
          !attendanceToday.check_in &&
          !attendanceToday.check_out
        ) {
          setShowIzinToHadirModal(true);
        } else if (attendanceToday.check_in && !attendanceToday.check_out) {
          setShowPulangModal(true);
        } else {
          setShowChoiceBesokModal(true);
        }
      } else {
        if (izinHariIni) {
          setShowIzinToHadirModal(true);
        } else {
          setShowChoiceModal(true);
        }
      }
    } catch (err) {
      toast.error("❌ QR tidak valid atau user tidak ditemukan");
    }
  };

  // === Upload Gambar ===
  const handleFileSelect = async (file: File) => {
    if (!file || !html5QrCodeRef.current) return;
    try {
      setIsScanning(true);
      const result = await html5QrCodeRef.current.scanFile(file, true);
      await handleScanResult(result);
    } catch (err) {
      toast.error("❌ Gagal membaca QR");
    } finally {
      setIsScanning(false);
    }
  };
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  // === Scan Kamera ===
  const startCameraScan = async () => {
    if (!html5QrCodeRef.current) return;
    setIsScanning(true);
    setScanMode("camera");
    try {
      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        { fps: 30, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          html5QrCodeRef.current?.stop();
          setIsScanning(false);
          handleScanResult(decodedText);
        }, 
        (errorMessage) => {
          console.warn("QR Code scan error: ", errorMessage);
        }
      );
    } catch (err) {
      toast.error("❌ Gagal buka kamera");
      setIsScanning(false);
    }
  };
  const stopCameraScan = async () => {
    if (html5QrCodeRef.current) {
      await html5QrCodeRef.current.stop();
      setIsScanning(false);
    }
  };

  // === Aksi dari modal (contoh hadir & pulang, sisanya bisa copy dari qrscan.tsx) ===
  const handleHadirSelection = async () => {
    if (!scanUserRef.current) return;
    try {
      await handleAbsenHadir(scanUserRef.current, false);
      toast.success(`✅ Hadir dicatat untuk ${scanUserRef.current.name}`);
      setShowChoiceModal(false);

      const isPiket = await getPiket({ user_id: scanUserRef.current.user_id });
      if (isPiket) {
        const msg = await getMessage("piket_reminder");
        if (msg) setNotifData(msg), setNotifOpen(true);
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handlePulang = async () => {
    if (!scanUserRef.current) return;
    setNotifData({
      title: "Konfirmasi Pulang",
      message: "Apakah yakin ingin pulang?",
      type: "clock_out_reminder",
    });
    setNotifOpen(true);
    setShowPulangModal(false);
  };

  const handleConfirmPulang = async () => {
    if (!scanUserRef.current) return;
    try {
      await handlePulangAction(
        { user_id: scanUserRef.current.user_id, name: scanUserRef.current.name, notes: keteranganPulang },
        false
      );
      toast.success(`Pulang dicatat untuk ${scanUserRef.current.name}`);
      setShowKeteranganPulangModal(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
        {/* Area upload */}
        {scanMode === "upload" && (
          <div
            className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mx-auto text-blue-600 w-8 h-8" />
            <p className="mt-2 text-gray-600">Klik untuk upload gambar QR</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
            />
          </div>
        )}

        {/* Area kamera */}
        {scanMode === "camera" && isScanning && (
          <div>
            <div
              id="qr-reader"
              className="w-full h-64 bg-gray-100 rounded-lg mb-3"
            />
            <button
              onClick={stopCameraScan}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg"
            >
              <X size={16} /> Stop Kamera
            </button>
          </div>
        )}

        {/* Tombol aksi */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setScanMode("upload")}
            disabled={isScanning}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            <Upload size={16} /> Upload
          </button>
          <button
            onClick={startCameraScan}
            disabled={isScanning}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            <Camera size={16} /> Kamera
          </button>
        </div>

        {/* === Modal sama seperti qrscan.tsx === */}
        <ClockInModal
          isOpen={showChoiceModal}
          onClose={() => setShowChoiceModal(false)}
          onSelectHadir={handleHadirSelection}
          onSelectIzin={() => {
            setShowChoiceModal(false);
            setShowIzinForm(true);
          }}
        />

        {showPulangModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/70">
            <div className="bg-white p-6 rounded-lg w-80">
              <h2 className="text-lg mb-4">Sudah Hadir</h2>
              <button
                onClick={handlePulang}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md mb-2"
              >
                Pulang
              </button>
              <button
                onClick={() => {
                  setShowIzinForm(true);
                  setShowPulangModal(false);
                }}
                className="w-full px-4 py-2 bg-orange-500 text-white rounded-md"
              >
                Izin Pulang Awal
              </button>
            </div>
          </div>
        )}

        {showKeteranganPulangModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/70">
            <div className="bg-white p-6 rounded-lg w-96">
              <h2 className="text-lg mb-2">Keterangan Pulang</h2>
              <textarea
                className="w-full border p-2 rounded mb-3"
                value={keteranganPulang}
                onChange={(e) => setKeteranganPulang(e.target.value)}
              />
              <button
                onClick={handleConfirmPulang}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md"
              >
                Simpan & Pulang
              </button>
            </div>
          </div>
        )}

        <ReminderModal
          title={notifData?.title}
          message={notifData?.message}
          type={notifData?.type || ""}
          isOpen={notifOpen}
          onConfirm={() => {
            setNotifOpen(false);
            setShowKeteranganPulangModal(true);
          }}
          onClose={() => setNotifOpen(false)}
        />
      </div>
    </div>
  );
}
