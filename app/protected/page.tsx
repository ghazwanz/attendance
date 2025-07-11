'use client';

import { useState } from "react";
import { QrCode } from "lucide-react";

export default function ProtectedPage() {
  const [showScanner, setShowScanner] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 dark:from-slate-900 dark:to-slate-800 px-6">
      <div className="max-w-xl w-full bg-white dark:bg-slate-900 shadow-2xl rounded-2xl p-8 space-y-8">
        
        {/* Judul */}
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            🏠 Beranda Absensi
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Klik tombol di bawah ini untuk memulai proses scan QR.
          </p>
        </div>

        {/* Tombol Pop-up */}
        <div className="grid grid-cols-1">
          <button
            onClick={() => setShowScanner(true)}
            className="flex items-center gap-3 justify-center w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
          >
            <QrCode size={18} />
            Scan QR
          </button>
        </div>
      </div>

      {/* MODAL SCANNER */}
      {showScanner && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl w-full max-w-lg relative">
            <button
              onClick={() => setShowScanner(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-lg"
            >
              ✖
            </button>

            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              📷 Scan QR
            </h2>

            <div className="text-center text-sm text-gray-600 dark:text-gray-300 mb-4">
              (Scanner QR bisa kamu integrasikan di sini)
            </div>

            {/* Placeholder QR area */}
            <div className="w-full h-64 bg-gray-200 dark:bg-slate-700 rounded-lg flex items-center justify-center text-gray-500">
              <span>📷 QR Scanner Area</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
