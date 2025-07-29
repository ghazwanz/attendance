'use client';

import { useEffect, useState } from "react";
import { QrCode, CalendarCheck, UserCheck, Clock9, Ban, Home, UserX } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { createClient } from '@/lib/supabase/client';
import { Attendance } from "@/lib/type";

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
  const [userId, setUserId] = useState<string | undefined>();
  const [showScanner, setShowScanner] = useState(false);
  const [countAbsensi, setCountAbsensi] = useState(0);
  const [countIzin, setCountIzin] = useState(0);
  const [countHadir, setCountHadir] = useState(0);
  const [countTerlambat, setCountTerlambat] = useState(0);
  const [countAlpha, setCountAlpha] = useState(0);
  const [recentAttendance, setRecentAttendance] = useState<Attendance[] | any[]>([]);

  useEffect(() => {
    const supabase = createClient();
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/auth/login';
        return;
      }

      setUserId(user.id);

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
    };

    fetchData();

    const channel = supabase
      .channel("realtime:attendances")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "attendances",
        },
        (payload) => {
          const newRecord = payload.new;
          if (newRecord.user_id === userId) {
            setRecentAttendance((prev) => {
              const updated = [newRecord, ...prev];
              return updated
                .filter((v, i, self) => self.findIndex(x => x.id === v.id) === i)
                .sort((a, b) =>
                  new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                )
                .slice(0, 6);
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const handleShowQR = () => {
    setShowScanner(true);
  };

  const qrData = JSON.stringify({ user_id: userId });

  const dashboardCards = [
    {
      title: 'Jumlah Absensi',
      value: countAbsensi,
      icon: <CalendarCheck className="w-8 h-8" />,
      bg: 'bg-sky-500 dark:bg-blue-800',
    },
    {
      title: 'Kehadiran',
      value: countHadir,
      icon: <UserCheck className="w-8 h-8" />,
      bg: 'bg-green-500 dark:bg-green-600',
    },
    {
      title: 'Izin',
      value: countIzin,
      icon: <Ban className="w-8 h-8" />,
      bg: 'bg-yellow-500 dark:bg-yellow-600',
    },
    {
      title: 'Terlambat',
      value: countTerlambat,
      icon: <Clock9 className="w-8 h-8" />,
      bg: 'bg-red-500 dark:bg-red-600',
    },
    {
      title: 'Alpa',
      value: countAlpha,
      icon: <UserX className="w-8 h-8" />,
      bg: 'bg-red-700 dark:bg-red-800',
    },
  ];

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

        <div className="w-full max-w-md sm:max-w-none bg-white dark:bg-slate-900 shadow-2xl rounded-2xl p-6 sm:p-8 space-y-6 sm:space-y-8">
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
              <QRCodeSVG value={qrData} size={200} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
