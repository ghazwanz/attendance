'use client';

import { useEffect, useState, useRef } from "react";
import {
  QrCode, CalendarCheck, UserCheck, Clock9, Ban, UserX, Home
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { createClient } from '@/lib/supabase/client';
import { Attendance as BaseAttendance } from "@/lib/type";
import { toast } from "react-hot-toast";
import QRCode from "qrcode";



type Attendance = BaseAttendance & {
  users?: { name?: string };
  user?: { id?: string; name?: string; role?: string };
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
  const [userId, setUserId] = useState<string>();
  const [showScanner, setShowScanner] = useState(false);
  const [countAbsensi, setCountAbsensi] = useState(0);
  const [countIzin, setCountIzin] = useState(0);
  const [countHadir, setCountHadir] = useState(0);
  const [countTerlambat, setCountTerlambat] = useState(0);
  const [countAlpha, setCountAlpha] = useState(0);
  const [pendingIzin, setPendingIzin] = useState<Attendance[]>([]);
  const [recentAttendance, setRecentAttendance] = useState<Attendance[]>([]);
  const [isPiketToday, setIsPiketToday] = useState(false);
  const qrRef = useRef<SVGSVGElement | null>(null);


 
type QRModalProps = {
  session: {
    user?: {
      id?: string;
    };
  };
};

function QRModal({ session }: QRModalProps) {
  // Simpan value QR di satu state untuk modal & download
  const [qrValue] = useState(
    JSON.stringify({ userId: session?.user?.id })
  );

  const handleDownloadQR = async () => {
    if (!qrValue) return;

    try {
      // Generate PNG dengan background putih
      const dataUrl = await QRCode.toDataURL(qrValue, {
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF"
        }
      });

      // Buat link download & klik otomatis
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "qr-code.png";
      link.click();
    } catch (error) {
      console.error("Gagal generate QR code:", error);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {/* QR yang tampil di modal */}
      <QRCodeSVG value={qrValue} size={200} />

      {/* Tombol download */}
      <button
        onClick={handleDownloadQR}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Download QR
      </button>
    </div>
  );
}
  useEffect(() => {
    const supabase = createClient();

    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/auth/login';
        return;
      }
      setUserId(user.id);

      // Nama hari sekarang (lowercase)
      const todayName = new Date().toLocaleDateString("id-ID", {
        weekday: "long",
      }).toLowerCase();

      // ✅ Cek piket berdasarkan hari
      const { data: piketToday, error: piketError } = await supabase
        .from('piket')
        .select('user_id, schedules!inner(day)')
        .eq('user_id', user.id)
        .eq('schedules.day', todayName)
        .maybeSingle();

      if (piketError) console.error("Error cek piket:", piketError);

      if (piketToday) {
        setIsPiketToday(true);
        toast.dismiss();
        toast(
          <div>
            <div className="font-bold">📢 Anda piket hari ini</div>
            <div>Jangan lupa laksanakan tugas piket dengan baik.</div>
          </div>,
          { duration: 6000, id: 'piket-toast' }
        );
      } else {
        setIsPiketToday(false);
      }

      // Statistik absensi
      const { count: countAbsensis } = await supabase
        .from('attendances')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      setCountAbsensi(countAbsensis || 0);

      const { count: countIzins } = await supabase
        .from('attendances')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'IZIN');
      setCountIzin(countIzins || 0);

      const { count: countHadirs } = await supabase
        .from('attendances')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .in('status', ['HADIR', 'TERLAMBAT']);
      setCountHadir(countHadirs || 0);

      const { count: countTerlambats } = await supabase
        .from('attendances')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'TERLAMBAT');
      setCountTerlambat(countTerlambats || 0);

      const { count: countAlphas } = await supabase
        .from('attendances')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'ALPA');
      setCountAlpha(countAlphas || 0);

      const { data } = await supabase
        .from('attendances')
        .select(`*, users(name)`)
        .eq('user_id', user.id)
        .limit(6)
        .order('created_at', { ascending: false });
      setRecentAttendance(data || []);

      const { data: pending } = await supabase
        .from('permissions')
        .select(`*, user:users!permissions_user_id_fkey(id, name, role), approver:users!permissions_approved_by_fkey(id, name, role)`)
        .eq('status', 'pending');
      setPendingIzin(pending || []);
    };

    fetchData();

    // Real-time attendance listener
    const channel = supabase
      .channel("realtime:attendances")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "attendances" },
        (payload) => {
          const rawRecord = payload.new as any;
          const newRecord: Attendance = {
            ...rawRecord,
            users: rawRecord.users || { name: '' },
          };
          setRecentAttendance((prev) => {
            const updated = [newRecord, ...prev];
            return updated
              .filter((v, i, self) => self.findIndex(x => x.id === v.id) === i)
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0, 6);
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const qrExpiry = Date.now() + 5 * 60 * 1000;
  const qrData = JSON.stringify({ user_id: userId, expires_at: qrExpiry });

  const dashboardCards = [
    { title: 'Jumlah Absensi', value: countAbsensi, icon: <CalendarCheck className="w-8 h-8" />, bg: 'bg-sky-500 dark:bg-blue-800' },
    { title: 'Kehadiran', value: countHadir, icon: <UserCheck className="w-8 h-8" />, bg: 'bg-green-500 dark:bg-green-600' },
    { title: 'Izin', value: countIzin, icon: <Ban className="w-8 h-8" />, bg: 'bg-yellow-500 dark:bg-yellow-600' },
    { title: 'Terlambat', value: countTerlambat, icon: <Clock9 className="w-8 h-8" />, bg: 'bg-red-500 dark:bg-red-600' },
    { title: 'Alpa', value: countAlpha, icon: <UserX className="w-8 h-8" />, bg: 'bg-red-700 dark:bg-red-800' },
  ];

  // Show QR handler
  const handleShowQR = () => {
    setShowScanner(true);
  };

  // Download QR handler for modal QR
  const handleDownloadQR = async () => {
    if (!qrData) return;

    try {
      const dataUrl = await QRCode.toDataURL(qrData, {
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF"
        }
      });

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "qr-code.png";
      link.click();
    } catch (error) {
      console.error("Gagal generate QR code:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col gap-12 items-center justify-start bg-gradient-to-br from-blue-100 to-blue-300 dark:from-slate-900 dark:to-slate-800 px-4 sm:px-6 py-10">
      <div className="flex items-stretch flex-col justify-start w-full gap-5">
        <h1 className="text-2xl flex items-center gap-2">
          <Home className="w-6 h-6" />
          Dashboard
        </h1>

        <div className="grid lg:grid-cols-5 sm:grid-cols-3 grid-cols-2 gap-4 items-stretch">
          {dashboardCards.map((card, index) => (
            <div
              key={index}
              className={`flex flex-col items-center justify-center text-white p-5 rounded-xl shadow-lg transition transform hover:scale-105 ${card.bg}`}
            >
              <div className="mb-2">{card.icon}</div>
              <h2 className="text-base font-medium">{card.title}</h2>
              <p className="text-3xl font-bold">{card.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex lg:flex-row gap-5 items-stretch w-full flex-col">
        <div className="bg-white w-full dark:bg-slate-800 shadow-md rounded-xl p-6">
          <h2 className="text-lg font-semibold text-center text-gray-800 dark:text-white mb-4">
            Riwayat Absensi Terbaru
          </h2>
          {recentAttendance?.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-10">
              Belum ada data absensi.
            </p>
          ) : (
            <div className="space-y-4">
              {recentAttendance.map((record) => {
                const statusColor: Record<string, string> = {
                  hadir: 'bg-green-100 text-green-700',
                  izin: 'bg-yellow-100 text-yellow-700',
                  'tanpa keterangan': 'bg-red-100 text-red-700',
                  terlambat: 'bg-orange-100 text-orange-700',
                };

                const statusLabel = record.status?.toLowerCase();
                const timeLabel =
                  statusLabel === 'izin'
                    ? formatTimestamp(record.created_at)
                    : formatTimestamp(record.check_in || record.created_at);

                return (
                  <div
                    key={record.id}
                    className="flex items-center justify-between border border-gray-200 dark:border-slate-600 rounded-lg px-4 py-3 bg-white dark:bg-slate-700 shadow-sm"
                  >
                    <div className="flex flex-col">
                      <p className="font-semibold text-gray-800 dark:text-white">
                        {record.users?.name || 'Tidak Diketahui'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{timeLabel}</p>
                    </div>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${statusColor[statusLabel] || 'bg-gray-100 text-gray-600'}`}
                    >
                      {record.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5 w-full items-stretch">
          <div className="w-full max-w-md sm:max-w-none h-full bg-white dark:bg-slate-900 shadow-2xl rounded-2xl p-6 sm:p-8 space-y-6 sm:space-y-8">
            <div className="text-center space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
                🏠 Beranda Absensi
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Tekan tombol untuk menampilkan QR Absensi.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={handleShowQR}
                className="group relative flex items-center justify-center gap-3 w-full px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold text-base shadow-md hover:shadow-lg transition-all duration-300"
              >
                <QrCode className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                <span className="tracking-wide">QR Scan</span>
              </button>
            </div>
          </div>
          {pendingIzin.length > 0 && (
            <div className=" w-full h-full bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-yellow-700 dark:text-yellow-400 mb-4 flex items-center gap-2">
                <Clock9 className="w-5 h-5" />
                Izin Belum Di-ACC Admin
              </h2>
              <div className="overflow-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700 text-sm">
                  <thead className="bg-yellow-100 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Nama</th>
                      <th className="px-4 py-3 text-left font-semibold">Tanggal Pengajuan</th>
                      <th className="px-4 py-3 text-left font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                    {pendingIzin.map((izin) => (
                      <tr key={izin.id} className="hover:bg-yellow-50 dark:hover:bg-slate-700 transition">
                        <td className="px-4 py-3 text-gray-800 dark:text-white">
                          {izin.user?.name || 'Tidak Diketahui'}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                          {formatTimestamp(izin.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-block bg-yellow-200 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">
                            Menunggu ACC
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {showScanner && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xl w-full max-w-xs sm:max-w-md relative">
            <button
              onClick={() => setShowScanner(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-lg"
            >
              ✖
            </button>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
              📷 QR Anda
            </h2>
            <div className="text-center text-sm text-gray-600 mb-4">
              Tunjukkan QR ini ke scanner untuk absensi.
            </div>
            <div className="flex justify-center">
              <QRCodeSVG value={qrData} size={200} ref={qrRef} />
            </div>
            <div className="flex justify-center mt-6">
              <button
                onClick={handleDownloadQR}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition"
              >
                Download QR
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
