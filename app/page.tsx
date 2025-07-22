// app/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { AuthButton } from '@/components/auth-button';
import { Hero } from '@/components/hero';
import { EnvVarWarning } from '@/components/env-var-warning';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { hasEnvVars } from '@/lib/utils';
import { QRCodeSVG } from "qrcode.react";

interface User {
  id: string;
  name: string;
}

export default async function Home({ searchParams }: { searchParams: Promise<{ user_id?: string; status?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { user_id, status } = await searchParams;


  if (user) redirect('/protected');

  const { data: users } = await supabase.from('users').select('id, name').order('name', { ascending: true });

  // const selectedUser = users?.find((u) => u.id === searchParams.user_id) ?? null;

  const qrData = user_id && status
    ? JSON.stringify({ user_id: user_id, status:status })
    : null;

  const encryptedQRData = qrData ? btoa(qrData) : null;
  console.log(encryptedQRData)
  const decryptedQRData = encryptedQRData ? atob(encryptedQRData) : null;
  console.log(decryptedQRData);
  // const qrImage = qrData ? await QRCodeSVG.toDataURL(qrData) : null;

  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        {/* NAVBAR */}
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <Link href="/protected">
              <div className="flex items-center gap-3">
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
              </div>
            </Link>
            {!hasEnvVars ? <EnvVarWarning /> : <AuthButton size="sm" />}
          </div>
        </nav>

        {/* HERO */}
        <div className="flex-1 flex flex-col gap-8 max-w-5xl p-5">
          <Hero />

          {/* QR AREA */}
          <div className="w-full max-w-xl mx-auto mt-8 text-center space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              ✨ Presensi Cepat Tanpa Login
            </h2>

            <form className="space-y-4">
              <select
                name="user_id"
                className="w-full p-2 border rounded bg-white dark:bg-gray-900 dark:text-white"
                defaultValue={user_id ?? ''}
              >
                <option value="" disabled>-- Pilih Nama --</option>
                {users?.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>

              <div className="space-x-4 mt-2">
                <button
                  name="status"
                  value="HADIR"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  type="submit"
                >
                  Tampilkan QR HADIR
                </button>
                <button
                  name="status"
                  value="IZIN"
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                  type="submit"
                >
                  Tampilkan QR IZIN
                </button>
              </div>
            </form>

            {qrData && user_id && (
              <div className="mt-6 text-center space-y-2">
                <QRCodeSVG value={qrData} width={200} height={200} />
              </div>
            )}
          </div>

          {/* LOGIN BUTTON */}
          <div className="flex-1 flex flex-col items-center gap-6 px-4 mt-8">
            <AuthButton />
          </div>
        </div>

        {/* FOOTER */}
        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-4">
          <p>
            Powered by{' '}
            <a
              href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
              target="_blank"
              className="font-bold hover:underline"
              rel="noreferrer"
            >
              Supabase
            </a>
          </p>
          <ThemeSwitcher />
        </footer>
      </div>
    </main>
  );
}
