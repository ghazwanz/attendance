'use client';

import { useEffect, useState } from "react";
import { QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { createClient } from '@/lib/supabase/client';
import { Attendance } from "@/lib/type";

const userMock = {
  id: 'user_id',
  name: 'Budi',
  role: 'employee'
};

const formatTimestamp = (timestamp: string) => {
  return new Date(timestamp).toLocaleString("id-ID", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ProtectedPage() {
  const [userId, setUserId] = useState<string | undefined>(userMock.id);
  const [showScanner, setShowScanner] = useState(false);
  const [status, setStatus] = useState<"HADIR" | "IZIN" | null>(null);
  const [countAbsensi, setCountAbsensi] = useState(0);
  const [countIzin, setCountIzin] = useState(0);
  const [countHadir, setCountHadir] = useState(0);
  const [countTerlambat, setCountTerlambat] = useState(0);
  const [countAlpha, setCountAlpha] = useState(0);
  const [recentAttendance, setRecentAttendance] = useState<Attendance[]|any[]>([]);

  useEffect(() => {
    const supabase = createClient();
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('User:', user);
      if (!user) {
        window.location.href = '/auth/login';
      }
      setUserId(user?.id);

      // Fetch counts absensi
      const { count: countAbsensis } = await supabase
        .from('attendances')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
      setCountAbsensi(countAbsensis || 0);

      // Fetch counts izin
      const { count: countIzins, error } = await supabase
        .from('attendances')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .eq('status', 'IZIN');
      setCountIzin(countIzins || 0);

      // Fetch counts hadir
      const { count: countHadirs } = await supabase
        .from('attendances')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .in('status', ['HADIR', 'TERLAMBAT']);
      console.log('Count Hadir:', countHadirs);
      setCountHadir(countHadirs || 0);

      // Fetch counts terlambat
      const { count: countTerlambats } = await supabase
        .from('attendances')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .eq('status', 'TERLAMBAT');
      console.log('Count Hadir:', countTerlambats);
      setCountTerlambat(countTerlambats || 0);

      const { count: countAlphas } = await supabase
        .from('attendances')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .eq('status', 'TANPA KETERANGAN');
      console.log('Count Hadir:', countAlphas);
      setCountAlpha(countAlphas || 0);

      const { data } = await supabase
        .from('attendances')
        .select(`
          *,
          users(
            name
          )
        `).eq('user_id', user?.id)
        .limit(6).order('created_at', { ascending: false });
      setRecentAttendance(data || []);
    };
    checkAuth();
  }, []);

  const handleShowQR = (statusType: "HADIR" | "IZIN") => {
    setStatus(statusType);
    setShowScanner(true);
  };

  const qrData = JSON.stringify({ user_id: userId, status: status });
  { console.log('QR Data:', qrData) }

  return (
    <div className="min-h-screen flex flex-col gap-12 items-center justify-start bg-gradient-to-br from-blue-100 to-blue-300 dark:from-slate-900 dark:to-slate-800 px-4 sm:px-6 py-10">
      <div className="flex items-stretch flex-col justify-start w-full gap-5">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="grid lg:grid-cols-5 sm:grid-cols-3 grid-cols-2 gap-5 items-stretch">
          <div className="flex flex-col gap-2 w-full text-white justify-center p-4 bg-sky-500 dark:bg-blue-800 rounded shadow-lg">
            <h2 className="text-xl font-medium">Jumlah Absensi</h2>
            <span className="ml-2 text-lg">{countAbsensi}</span>
          </div>
          <div className="flex flex-col gap-2 w-full justify-center text-white p-4 bg-green-500 dark:bg-green-600 rounded shadow-lg">
            <h2 className="text-xl font-medium">Kehadiran</h2>
            <span className="ml-2 text-lg">{countHadir}</span>
          </div>
          <div className="flex flex-col gap-2 w-full justify-center text-white p-4 bg-yellow-500 dark:bg-yellow-600 rounded shadow-lg">
            <h2 className="text-xl font-medium">Izin</h2>
            <span className="ml-2 text-lg">{countIzin}</span>
          </div>
          <div className="flex flex-col gap-2 w-full justify-center text-white p-4 bg-red-500 dark:bg-red-700 rounded shadow-lg">
            <h2 className="text-xl font-medium">Terlambat</h2>
            <span className="ml-2 text-lg">{countTerlambat}</span>
          </div>
          <div className="flex flex-col gap-2 w-full justify-center text-white p-4 bg-red-500 dark:bg-red-700 rounded shadow-lg">
            <h2 className="text-xl font-medium">Alpa</h2>
            <span className="ml-2 text-lg">{countAlpha}</span>
          </div>
        </div>
      </div>
      <div className="flex lg:flex-row gap-5 items-stretch w-full flex-col">
        <div className="bg-white w-full dark:bg-slate-800 shadow-md rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Riwayat Absensi Terbaru
          </h2>

          {recentAttendance?.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-10">
              Belum ada data absensi.
            </p>
          ) : (
            <div className="space-y-4">
              {recentAttendance.map((record) => (
                <div
                  key={record.id}
                  className="flex justify-between items-center bg-gray-50 dark:bg-slate-700 px-4 py-3 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{record.users?.name || 'Pengguna Tidak Diketahui'}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{record.status.toLowerCase() === 'izin' ? formatTimestamp(record.created_at) : formatTimestamp(record.check_in)}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${record.status.toLowerCase() === 'hadir'
                    ? 'bg-green-100 text-green-800'
                    : record.status.toLowerCase() === 'izin'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                    }`}>
                    {record.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="w-full max-w-md sm:max-w-none bg-white dark:bg-slate-900 shadow-2xl rounded-2xl p-6 sm:p-8 space-y-6 sm:space-y-8">
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
