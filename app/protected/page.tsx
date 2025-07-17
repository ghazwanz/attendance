'use client';

import { useEffect, useState } from "react";
import { QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { createClient } from '@/lib/supabase/client';

const userMock = {
  id: 'user_id',
  name: 'Budi',
  role: 'employee'
};

export default function ProtectedPage() {
  const [userId, setUserId] = useState<string | undefined>(userMock.id);
  const [showScanner, setShowScanner] = useState(false);
  const [status, setStatus] = useState<"HADIR" | "IZIN" | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('User:', user);
      if (!user) {
        window.location.href = '/auth/login';
      }
      setUserId(user?.id);
    };
    checkAuth();
  }, []);

  const handleShowQR = (statusType: "HADIR" | "IZIN") => {
    setStatus(statusType);
    setShowScanner(true);
  };

  const qrData = JSON.stringify({ user_id: userId, status:status });
  {console.log('QR Data:', qrData)}

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 dark:from-slate-900 dark:to-slate-800 px-4 sm:px-6 py-10">
      <div className="w-full max-w-md sm:max-w-lg bg-white dark:bg-slate-900 shadow-2xl rounded-2xl p-6 sm:p-8 space-y-6 sm:space-y-8">

        {/* Judul */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
            🏠 Beranda Absensi
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Pilih jenis kehadiran untuk menampilkan QR.
          </p>
        </div>

        {/* Dua Tombol QR */}
        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={() => handleShowQR("HADIR")}
            className="flex items-center gap-3 justify-center w-full py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition text-sm sm:text-base"
          >
            <QrCode size={18} />
            Tampilkan QR Scan HADIR
          </button>
          <button
            onClick={() => handleShowQR("IZIN")}
            className="flex items-center gap-3 justify-center w-full py-3 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-semibold transition text-sm sm:text-base"
          >
            <QrCode size={18} />
            Tampilkan QR Scan IZIN
          </button>
        </div>
      </div>

      {/* MODAL QR */}
      {
      showScanner && status && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-2xl shadow-xl w-full max-w-xs sm:max-w-md relative">
            <button
              onClick={() => setShowScanner(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-lg"
            >
              ✖
            </button>

            <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
              📷 QR Anda ({status})
            </h2>
            <div className="text-center text-sm text-gray-600 dark:text-gray-300 mb-4">
              Tunjukkan QR ini ke scanner untuk absensi {status.toLowerCase()}.
            </div>

            <div className="flex justify-center">
              <QRCodeSVG value={qrData} size={200} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
