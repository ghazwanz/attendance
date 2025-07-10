import {
  Moon,
  Home,
  Users,
  CalendarCheck2,
  ClipboardList,
  CalendarClock,
} from "lucide-react";
import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center bg-white text-black dark:bg-[#0f172a] dark:text-white transition-colors duration-300">
      <div className="flex-1 w-full flex flex-col items-center">

        {/* NAVBAR */}
        <nav className="w-full bg-white dark:bg-[#0f172a] shadow-md sticky top-0 z-50 transition-colors duration-300">
          <div className="max-w-7xl mx-auto flex justify-between items-center h-16 px-6">

            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
              <Image src="/logo1.png" width={32} height={32} className="dark:invert-0 invert" alt="Logo" />
              <span className="font-semibold text-lg tracking-wide">
                Mahative Studio
              </span>
            </div>

            {/* Menu Navigasi */}
            <div className="flex items-center gap-6 text-sm">
              <Link href="/protected/" className="flex items-center gap-1 hover:text-blue-500 dark:hover:text-white/80 transition">
                <Home size={16} /> Home
              </Link>
              <Link href="/protected/users" className="flex items-center gap-1 hover:text-blue-500 dark:hover:text-white/80 transition">
                <Users size={16} /> Users
              </Link>
              <Link href="/protected/attendances" className="flex items-center gap-1 hover:text-blue-500 dark:hover:text-white/80 transition">
                <CalendarCheck2 size={16} /> Attendance
              </Link>
              <Link href="/protected/permission" className="flex items-center gap-1 hover:text-blue-500 dark:hover:text-white/80 transition">
                <ClipboardList size={16} /> Permission
              </Link>
              <Link href="/protected/schedule" className="flex items-center gap-1 hover:text-blue-500 dark:hover:text-white/80 transition">
                <CalendarClock size={16} /> Schedule
              </Link>
            </div>

            {/* Auth & Theme */}
            <div className="flex items-center gap-4">
              <ThemeSwitcher />
              {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
            </div>
          </div>
        </nav>

        {/* CONTENT */}
        <div className="flex-1 flex w-full flex-col gap-20 max-w-6xl p-5">
          {children}
        </div>

        {/* FOOTER */}
        <footer className="w-full flex items-center justify-center border-t border-gray-200 dark:border-white/10 mx-auto text-center text-xs gap-8 py-16">
          <p>
            Powered by{" "}
            <a
              href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
              target="_blank"
              className="font-bold hover:underline"
              rel="noreferrer"
            >
              Supabase
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
