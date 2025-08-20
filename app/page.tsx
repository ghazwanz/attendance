import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Hero } from '@/components/hero';
import { EnvVarWarning } from '@/components/env-var-warning';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { hasEnvVars } from '@/lib/utils';
import { QRForm } from '@/components/QRForm';
import { AuthButton } from '@/components/auth-button';
import UserLocationSection from '@/components/UserLocationSection';
import QRWrapper from '@/components/QRWrapper';
import QRTips from '@/components/QRTips';
import AutoRequestNotification from "@/components/AutoRequestNotification";
import TestNotificationButton from "@/components/TestNotificationButton";
import LokasiKantor from '@/components/LokasiKantor';

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect('/protected');

  const { data: users } = await supabase.from('users').select('id, name').order('name', { ascending: true });

  return (
    <main className="min-h-screen flex flex-col items-center bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-slate-900 dark:to-slate-950">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        {/* NAVBAR */}
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 shadow-md bg-white/60 backdrop-blur-md dark:bg-slate-800/70">
          <div className="w-full max-w-6xl flex justify-between items-center px-5 text-sm">
            <Link href="/">
              <div className="flex items-center gap-3">
                <Image src="/logo1.png" width={36} height={36} className="dark:invert-0 invert" alt="Logo" />
                <span className="font-bold text-lg tracking-wide text-gray-900 dark:text-white">
                  Mahative Studio
                </span>
              </div>
            </Link>
            <AutoRequestNotification />
            {/* <TestNotificationButton /> */}
            {!hasEnvVars ? (
              <EnvVarWarning />
            ) : (
              <>
                {/* Desktop */}
                <div className="hidden md:flex space-x-6 items-center">
                  <Link
                    href="/scan"
                    className="text-gray-700 dark:text-white font-medium hover:text-blue-600 dark:hover:text-emerald-400 transition"
                  >
                    Scan
                  </Link>
                  <AuthButton />
                </div>

                {/* Mobile */}
                <div className="md:hidden">
                  <details className="relative">
                    <summary className="cursor-pointer list-none px-4 py-2 rounded-lg bg-neutral-200 dark:bg-neutral-800 dark:text-white">
                      ☰
                    </summary>
                    <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-neutral-800 shadow-lg rounded-lg z-50 overflow-hidden flex flex-col">
                      <Link
                        href="/auth/login"
                        className="px-4 py-2 text-sm hover:bg-blue-600 hover:text-white transition"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/auth/sign-up"
                        className="px-4 py-2 text-sm hover:bg-emerald-600 hover:text-white transition"
                      >
                        Sign Up
                      </Link>
                      <Link
                        href="/scan"
                        className="px-4 py-2 text-sm hover:bg-emerald-600 hover:text-white transition"
                      >
                        Scan
                      </Link>
                    </div>
                  </details>
                </div>
              </>
            )}
          </div>
        </nav>

        {/* HERO */}
        <div className="flex-1 flex flex-col gap-12 max-w-6xl px-6 py-10 sm:py-16">
          <Hero />
          {/* <QRForm users={users ?? []} encryptedQRData={null} /> */}
          <div>
            <QRWrapper />
            <QRTips />
          </div>
          

          {/* GOOGLE MAPS: Lokasi Mahative Studio */}
          <section className="mt-16 bg-gradient-to-r from-blue-100 via-white to-blue-200 dark:from-slate-800 dark:to-slate-900 rounded-3xl shadow-2xl p-8 max-w-6xl w-full transition-all duration-500">
            <h2 className="text-3xl font-extrabold text-center text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-2">
              <span className="text-red-500 text-3xl">📍</span>
              Lokasi Mahative Studio
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-300 mb-6 text-sm sm:text-base">
              Jalan Kemantren, Bandungrejosari, Sukun, Kota Malang – Jawa Timur, Indonesia
            </p>
            <LokasiKantor />        
          </section>
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
    </main>
  );
}
