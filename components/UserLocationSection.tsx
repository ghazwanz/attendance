'use client';

import { UserLocationSectionProps } from '@/lib/type';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// ⛱️ Dynamic import untuk hanya render di client
const UserLocationMap = dynamic(() => import('./userlocationmap'), {
  ssr: false,
});

export default function UserLocationSection({ isOutside, setIsOutside }: UserLocationSectionProps) {
  return (
    <section className="mt-16 bg-white/70 dark:bg-slate-800 rounded-3xl shadow-2xl p-8 max-w-6xl w-full">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-gray-900 dark:text-white mb-4">
        🌍 Lokasi Anda Sekarang
      </h2>
      <p className="text-center text-gray-600 dark:text-gray-300 mb-4 text-sm sm:text-base">
        Lokasi real-time Anda akan ditampilkan di bawah jika diizinkan oleh browser.
      </p>
      <Suspense fallback={<p className="text-center text-gray-400">Loading map...</p>}>
        <UserLocationMap isOutside={isOutside} setIsOutside={setIsOutside} />
      </Suspense>
    </section>
  );
}
