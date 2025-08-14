import {
  Moon,
  Home,
  Users,
  CalendarCheck2,
  ClipboardList,
  CalendarClock,
  QrCodeIcon,
  QrCode,
  CalendarDays,
  ClipboardCheckIcon,
} from "lucide-react";
import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button"; // ✅ diperbaiki di sini
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Toaster } from "react-hot-toast";
import { DeployButton } from "@/components/deploy-button";
import ReminderPage from "./reminder/page";

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
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <input type="checkbox" id="nav-toggle" className="peer hidden" />

            <div className="flex justify-between items-center h-16 relative">
              <Link href={"/protected"}>
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

              <label
                htmlFor="nav-toggle"
                className="lg:hidden cursor-pointer text-gray-700 dark:text-white"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </label>

              <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="flex items-center gap-6 text-sm">
                  <Link
                    href="/protected/"
                    className="flex items-center gap-1 hover:text-blue-500 dark:hover:text-white/80 transition"
                  >
                    <Home size={16} /> Home
                  </Link>
                  <Link
                    href="/scan"
                    className="flex items-center gap-1 hover:text-blue-500 dark:hover:text-white/80 transition"
                  >
                    <QrCode size={16} /> Scan
                  </Link>
                  <Link
                    href="/protected/users"
                    className="flex items-center gap-1 hover:text-blue-500 dark:hover:text-white/80 transition"
                  >
                    <Users size={16} /> Users
                  </Link>
                  <Link
                    href="/protected/attendances"
                    className="flex items-center gap-1 hover:text-blue-500 dark:hover:text-white/80 transition"
                  >
                    <CalendarCheck2 size={16} /> Kehadiran
                  </Link>
                  <Link
                    href="/protected/izin"
                    className="flex items-center gap-1 hover:text-blue-500 dark:hover:text-white/80 transition"
                  >
                    <ClipboardList size={16} /> Izin
                  </Link>
                  {/* Desktop Dropdown Schedule */}
                  <div className="relative p-2 group">
                    <button className="flex items-center gap-1 hover:text-blue-500 dark:hover:text-white/80 transition">
                      <CalendarClock size={16} /> Jadwal
                    </button>
                    <div className="absolute hidden group-hover:flex flex-col bg-white dark:bg-slate-800 shadow-lg rounded-md mt-2 min-w-[180px] z-50">
                      <Link
                        href="/protected/schedule"
                        className="px-4 py-2 flex gap-1 hover:bg-gray-100 dark:hover:bg-slate-700 transition whitespace-nowrap"
                      >
                        <CalendarClock size={16} /> Jadwal
                      </Link>
                      <Link
                        href="/protected/jadwal-piket"
                        className="px-4 py-2 flex gap-1 hover:bg-gray-100 dark:hover:bg-slate-700 transition whitespace-nowrap"
                      >
                        <ClipboardList size={16} /> Jadwal Piket
                      </Link>
                      <Link
                        href="/protected/reminder"
                        className="px-4 py-2 flex gap-1 hover:bg-gray-100 dark:hover:bg-slate-700 transition whitespace-nowrap"
                      >
                        <ClipboardCheckIcon size={16} /> Pengingat
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hidden lg:flex items-center gap-1">
                <ThemeSwitcher />
                {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
              </div>
            </div>

            <div className="lg:peer-checked:hidden peer-checked:flex hidden flex-col gap-4 py-4 lg:hidden text-sm border-t border-gray-200 dark:border-slate-700">
              <Link
                href="/protected/"
                className="flex items-center gap-2 px-2 hover:text-blue-500 dark:hover:text-white/80 transition"
              >
                <Home size={16} /> Home
              </Link>
              <Link
                href="/protected/scan"
                className="flex items-center gap-2 px-2 hover:text-blue-500 dark:hover:text-white/80 transition"
              >
                <QrCode size={16} /> Scan
              </Link>
              <Link
                href="/protected/users"
                className="flex items-center gap-2 px-2 hover:text-blue-500 dark:hover:text-white/80 transition"
              >
                <Users size={16} /> Users
              </Link>
              <Link
                href="/protected/attendances"
                className="flex items-center gap-2 px-2 hover:text-blue-500 dark:hover:text-white/80 transition"
              >
                <CalendarCheck2 size={16} /> Attendance
              </Link>
              <Link
                href="/protected/izin"
                className="flex items-center gap-2 px-2 hover:text-blue-500 dark:hover:text-white/80 transition"
              >
                <ClipboardList size={16} /> izin
              </Link>
              <Link
                href="/protected/schedule"
                className="flex items-center gap-2 px-2 hover:text-blue-500 dark:hover:text-white/80 transition"
              >
                <CalendarClock size={16} /> Schedule
              </Link>
              <Link
                href="/protected/jadwal-piket"
                className="flex items-center gap-2 px-2 hover:text-blue-500 dark:hover:text-white/80 transition"
              >
                <CalendarClock size={16} /> Jadwal Piket
              </Link>
              <Link
                href="/protected/reminder"
                className="flex items-center gap-2 px-2 hover:text-blue-500 dark:hover:text-white/80 transition"
              >
                <CalendarClock size={16} /> Reminder
              </Link>
              <div className="flex items-center gap-3 px-2">
                <ThemeSwitcher />
                {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
              </div>
            </div>
          </div>
        </nav>

        <div className="flex-1 flex w-full flex-col gap-20 max-w-7xl sm:p-5 p-4">
          {children}
        </div>

        <footer className="w-full flex items-center justify-center border-t border-gray-200 dark:border-white/10 mx-auto text-center text-xs gap-8 py-4">
          <p className="font-bold">
            Copyright © All Rights Reserved  
          </p>
          {/* <DeployButton /> */}
        </footer>
      </div>
    </main>
  );
}
