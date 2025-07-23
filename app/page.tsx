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

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) redirect('/protected');

  const { data: users } = await supabase.from('users').select('id, name').order('name', { ascending: true });

  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        {/* NAVBAR */}
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <Link href="/">
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
            {!hasEnvVars ? (
              <EnvVarWarning />
            ) : (
              <div className="space-x-5 flex justify-center items-center">
                <Link
                  href="/scan"
                  className="font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-100 dark:hover:text-neutral-300 transition"
                >
                  Scan
                </Link>
                <AuthButton />
              </div>
            )}
          </div>
        </nav>

        {/* HERO */}
        <div className="flex-1 flex flex-col gap-8 max-w-5xl p-5">
          <Hero />
          <QRForm users={users ?? []} encryptedQRData={null} />
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
