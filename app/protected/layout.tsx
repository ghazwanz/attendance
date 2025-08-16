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
import Navbar from "@/components/ui/Navbar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center bg-white text-black dark:bg-[#0f172a] dark:text-white transition-colors duration-300">
      <div className="flex-1 w-full flex flex-col items-center">
        {/* NAVBAR */}
        <Navbar/>

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
