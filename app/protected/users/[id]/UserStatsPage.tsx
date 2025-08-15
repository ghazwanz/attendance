"use client";
import { useState, useEffect } from 'react';
import { getUserAttendanceStats } from './UserStats';

export default function UserStatsPage({ params }: { params: Promise<{ id: string }> }) {
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    async function fetchStats() {
      const { id } = await params;
      const result = await getUserAttendanceStats(id, month, year);
      setStats(result);
    }
    fetchStats();
  }, [month, year, params]);

  const monthNames = [
    'JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI',
    'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'
  ];

  return (
    <div className="max-w-2xl mx-auto mt-8">
      {/* User Info */}
      <div className="mb-6 p-4 rounded-xl bg-white dark:bg-slate-800 shadow flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-lg font-bold text-blue-700 dark:text-white">{stats?.name ?? '-'}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">{stats?.email ?? '-'}</div>
        </div>
      </div>
      <div className="flex gap-4 mb-6 items-end">
        <div>
          <label className="block text-sm font-semibold mb-1">Bulan</label>
          <select value={month} onChange={e => setMonth(Number(e.target.value))} className="px-4 py-2 rounded-lg border w-40">
            {monthNames.map((name, i) => (
              <option key={i + 1} value={i + 1}>{name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Tahun</label>
          <select value={year} onChange={e => setYear(Number(e.target.value))} className="px-4 py-2 rounded-lg border w-32">
            {[...Array(5)].map((_, i) => {
              const y = new Date().getFullYear() - i;
              return <option key={y} value={y}>{y}</option>;
            })}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl shadow-lg p-6 flex flex-col items-center">
          <span className="text-4xl font-bold mb-2">{stats?.jumlahAbsensi ?? '-'}</span>
          <span className="text-lg font-semibold">Jumlah Absensi</span>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-700 text-white rounded-xl shadow-lg p-6 flex flex-col items-center">
          <span className="text-4xl font-bold mb-2">{stats?.jumlahMasuk ?? '-'}</span>
          <span className="text-lg font-semibold">Jumlah Masuk</span>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-700 text-white rounded-xl shadow-lg p-6 flex flex-col items-center">
          <span className="text-4xl font-bold mb-2">{stats?.jumlahTerlambat ?? '-'}</span>
          <span className="text-lg font-semibold">Jumlah Terlambat</span>
        </div>
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-xl shadow-lg p-6 flex flex-col items-center">
          <span className="text-4xl font-bold mb-2">{stats?.jumlahIzin ?? '-'}</span>
          <span className="text-lg font-semibold">Jumlah Izin</span>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-red-700 text-white rounded-xl shadow-lg p-6 flex flex-col items-center">
          <span className="text-4xl font-bold mb-2">{stats?.jumlahAlpa ?? '-'}</span>
          <span className="text-lg font-semibold">Jumlah Alpa</span>
        </div>
      </div>
    </div>
  );
}
