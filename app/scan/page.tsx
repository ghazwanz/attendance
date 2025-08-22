'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import QRScanner from './qrscan';
import UserLocationSection from '@/components/UserLocationSection';
import { useLocationStores } from '@/lib/stores/useLocationStores';
import QRTips from '@/components/QRTips';
import { ThemeSwitcher } from '@/components/theme-switcher';

interface AttendanceRecord {
  id: string;
  user_id: string;
  date: string;
  check_in: string;
  check_out: string;
  notes: string;
  created_at: string;
  status: string;
  users: {
    name: string;
  };
}

export default function AttendancePage() {
  const [recentAttendance, setRecentAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  // const [isOutside, setIsOutside] = useState<boolean>(false);
  const [user, setUser] = useState<any>()
  const isOutside = useLocationStores(state => state.isOutside)
  // const setIsOutside = useLocationStores(state => state.setIsOutside)
  const supabase = createClient();

  useEffect(() => {
    loadRecentAttendance();
    getUser()

    const channel = supabase
      .channel('attendance-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'attendances',
        },
        async (payload) => {
          const rawRecord = payload.new as any;
          const newRecord: AttendanceRecord = {
            id: rawRecord.id,
            user_id: rawRecord.user_id,
            date: rawRecord.date,
            check_in: rawRecord.check_in,
            check_out: rawRecord.check_out,
            notes: rawRecord.notes,
            created_at: rawRecord.created_at,
            status: rawRecord.status,
            users: rawRecord.users || { name: '' },
          };

          // Fetch name if not included (optional enhancement)
          if (!newRecord.users || !newRecord.users.name) {
            const { data: userData } = await supabase
              .from('users')
              .select('name')
              .eq('id', newRecord.user_id)
              .single();

            newRecord.users = userData ?? { name: '' };
          }

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

  const loadRecentAttendance = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('attendances')
        .select(`*, users(name)`)
        .limit(6)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecentAttendance(data || []);
    } catch (error) {
      console.error('Error loading attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUser = async () => {
    const { data } = await supabase.auth.getUser()
    setUser(data.user)
  }

  const handleScanSuccess = () => {
    loadRecentAttendance();
  };

  const handleScanError = (error: string) => {
    console.error('Scan error:', error);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen">
      {/* NAVBAR */}
      <nav className="w-full border-b border-b-foreground/10">
        <div className="max-w-5xl mx-auto flex justify-between items-center p-3 px-5 h-16">
          <Link href="/protected" className="flex items-center gap-3">
            <Image
              src="/logo1.png"
              width={32}
              height={32}
              className="dark:invert-0 invert"
              alt="Logo"
            />
            <span className="font-semibold md:text-lg text-sm tracking-wide text-gray-900 dark:text-white">
              Mahative Studio
            </span>
          </Link>
          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-gray-900 dark:text-white"
            >
              ☰
            </button>
          </div>
          <div className="hidden md:flex gap-3">
            {user ?
              <Link href="/" className="px-4 py-2 rounded-xl font-medium bg-neutral-200 text-neutral-900 hover:bg-blue-600 hover:text-white dark:bg-neutral-800 dark:text-white dark:hover:bg-blue-500 transition">Dashboard</Link>
              :
              <>
                <Link href="/" className="px-4 py-2 rounded-xl font-medium bg-neutral-200 text-neutral-900 hover:bg-blue-600 hover:text-white dark:bg-neutral-800 dark:text-white dark:hover:bg-blue-500 transition">Home</Link>
                <Link href="/auth/login" className="px-4 py-2 rounded-xl font-medium bg-neutral-100 text-neutral-900 hover:bg-emerald-600 hover:text-white dark:bg-neutral-700 dark:text-white dark:hover:bg-emerald-500 transition">Login</Link>
              </>
            }
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden flex flex-col items-end px-5 pb-3 gap-2">
            {user ?
              <Link href="/" className="px-4 py-2 rounded-xl font-medium bg-neutral-200 text-neutral-900 hover:bg-blue-600 hover:text-white dark:bg-neutral-800 dark:text-white dark:hover:bg-blue-500 transition w-full text-center">Dashboard</Link>
              :
              <>
                <Link href="/" className="px-4 py-2 rounded-xl font-medium bg-neutral-200 text-neutral-900 hover:bg-blue-600 hover:text-white dark:bg-neutral-800 dark:text-white dark:hover:bg-blue-500 transition w-full text-center">Home</Link>
                <Link href="/auth/login" className="px-4 py-2 rounded-xl font-medium bg-neutral-100 text-neutral-900 hover:bg-emerald-600 hover:text-white dark:bg-neutral-700 dark:text-white dark:hover:bg-emerald-500 transition w-full text-center">Login</Link>
              </>
            }
          </div>
        )}
      </nav>

      <div className="pt-10 w-full px-4 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            📲 Sistem Absensi
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Scan QR Code untuk mencatat kehadiran secara otomatis
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR SCANNER */}
          <div className="bg-white dark:bg-slate-800 shadow-md rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              QR Scanner
            </h2>
            <QRScanner
              onScanSuccess={handleScanSuccess}
              onScanError={handleScanError}
              isOutside={isOutside}
            // setIsOutside={setIsOutside}
            />
          </div>

          {/* RIWAYAT ABSENSI */}
          <div className="bg-white dark:bg-slate-800 shadow-md rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Riwayat Kehadiran Terbaru
            </h2>
            {loading ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mx-auto"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Memuat data...</p>
              </div>
            ) : recentAttendance.length === 0 ? (
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
                      <p className="font-medium text-gray-900 dark:text-white">
                        {record.users?.name || 'Pengguna Tidak Diketahui'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {(record.status.toLowerCase() === 'hadir' || record.status.toLowerCase() === 'terlambat')
                          ? formatTimestamp(record.check_in)
                          : formatTimestamp(record.created_at)}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${(record.status.toLowerCase() === 'izin' || (record.notes && record.notes.toLowerCase().includes('izin keluar')))
                        ? 'bg-yellow-100 text-yellow-800'
                        : record.status.toLowerCase() === 'hadir'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                        }`}
                    >
                      {record.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* LOKASI PENGGUNA */}
        <UserLocationSection isOutside={isOutside} />
        {/* TIPS */}
        <QRTips />
      </div>
      {/* FOOTER */}
      <footer className="w-full flex items-center justify-center border-t border-gray-200 dark:border-white/10 mx-auto text-center text-xs gap-8 py-4">
        <p className="font-bold">
          Copyright © All Rights Reserved
        </p>
        {/* <DeployButton /> */}
        <ThemeSwitcher />
      </footer>
    </div>
  );
}
