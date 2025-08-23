"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { AuthButton } from "../auth-button";
// import { EnvVarWarning } from "../env-var-warning";
import { ThemeSwitcher } from "../theme-switcher";
import { CalendarCheck2, CalendarClock, ClipboardCheckIcon, ClipboardList, ClipboardListIcon, ClipboardPen, ClipboardType, Home, LucideClipboardEdit, LucideClipboardType, QrCode, Settings, Users } from "lucide-react";
import Image from "next/image";
// import { hasEnvVars } from "@/lib/utils";



const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<any>(undefined);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const supabase = createClient();
        (async () => {
            const { data } = await supabase.auth.getUser();
            setUser(data?.user ?? null);
            setLoading(false);
        })();
    }, []);
    return (
        <nav className="w-full bg-white dark:bg-[#0f172a] shadow-md sticky top-0 z-50 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                {/* Mobile menu toggle */}

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

                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="lg:hidden cursor-pointer text-gray-700 dark:text-white bg-transparent border-none"
                        aria-label="Toggle navigation"
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
                    </button>

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
                            {
                                user?.user_metadata.role === 'admin' ?
                                    <Link
                                        href="/protected/users"
                                        className="flex items-center gap-1 hover:text-blue-500 dark:hover:text-white/80 transition"
                                    >
                                        <Users size={16} /> User
                                    </Link>
                                    :
                                    <Link
                                        href="/protected/settings"
                                        className="flex items-center gap-1 hover:text-blue-500 dark:hover:text-white/80 transition"
                                    >
                                        <Settings size={16} /> Pengaturan
                                    </Link>
                            }
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
                                        <CalendarClock size={16} /> Jadwal Masuk
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
                                    <Link
                                        href="/protected/location"
                                        className="px-4 py-2 flex gap-1 hover:bg-gray-100 dark:hover:bg-slate-700 transition whitespace-nowrap"
                                    >
                                        <ClipboardType size={16} /> Lokasi
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="hidden lg:flex items-center gap-1">
                        <ThemeSwitcher />
                        {!loading && <AuthButton user={user} />}
                        {/* {!hasEnvVars ? <EnvVarWarning /> : } */}
                    </div>
                </div>

                {isOpen && (
                    <div className="flex flex-col gap-4 py-4 lg:hidden text-sm border-t border-gray-200 dark:border-slate-700">
                        <Link href="/protected/" className="flex items-center gap-2 px-2 hover:text-blue-500 dark:hover:text-white/80 transition" onClick={() => setIsOpen(false)}>
                            <Home size={16} /> Home
                        </Link>
                        <Link href="/protected/scan" className="flex items-center gap-2 px-2 hover:text-blue-500 dark:hover:text-white/80 transition" onClick={() => setIsOpen(false)}>
                            <QrCode size={16} /> Scan
                        </Link>
                        {user?.user_metadata?.role === 'admin' ? (
                            <Link href="/protected/users" className="flex items-center gap-1 hover:text-blue-500 dark:hover:text-white/80 transition" onClick={() => setIsOpen(false)}>
                                <Users size={16} /> User
                            </Link>
                        ) : (
                            <Link href="/protected/settings" className="flex items-center gap-1 hover:text-blue-500 dark:hover:text-white/80 transition" onClick={() => setIsOpen(false)}>
                                <Settings size={16} /> Pengaturan
                            </Link>
                        )}
                        <Link href="/protected/attendances" className="flex items-center gap-2 px-2 hover:text-blue-500 dark:hover:text-white/80 transition" onClick={() => setIsOpen(false)}>
                            <CalendarCheck2 size={16} /> Absensi
                        </Link>
                        <Link href="/protected/izin" className="flex items-center gap-2 px-2 hover:text-blue-500 dark:hover:text-white/80 transition" onClick={() => setIsOpen(false)}>
                            <ClipboardList size={16} /> izin
                        </Link>
                        <Link href="/protected/schedule" className="flex items-center gap-2 px-2 hover:text-blue-500 dark:hover:text-white/80 transition" onClick={() => setIsOpen(false)}>
                            <CalendarClock size={16} /> Jadwal Masuk
                        </Link>
                        <Link href="/protected/jadwal-piket" className="flex items-center gap-2 px-2 hover:text-blue-500 dark:hover:text-white/80 transition" onClick={() => setIsOpen(false)}>
                            <ClipboardList size={16} /> Jadwal Piket
                        </Link>
                        <Link href="/protected/reminder" className="flex items-center gap-2 px-2 hover:text-blue-500 dark:hover:text-white/80 transition" onClick={() => setIsOpen(false)}>
                            <ClipboardCheckIcon size={16} /> Pengingat
                        </Link>
                        <Link href="/protected/location" className="flex items-center gap-2 px-2 hover:text-blue-500 dark:hover:text-white/80 transition" onClick={() => setIsOpen(false)}>
                            <ClipboardType size={16} /> Lokasi
                        </Link>
                        <div className="flex items-center gap-3 px-2">
                            <ThemeSwitcher />
                            {/* {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />} */}
                            {!loading && <AuthButton user={user} />}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}

export default Navbar