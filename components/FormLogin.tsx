"use client"

import Link from "next/link";
import { handleLogin } from "@/lib/auth/action";
import { useActionState, useEffect } from "react";
import toast from "react-hot-toast";
import { ThemeSwitcher } from "./theme-switcher";

export function FormLogin() {
    const [state, action, pending] = useActionState(handleLogin, null);

    // Handle toast notifications using the use hook
    useEffect(() => {
        if (state?.error) toast.error(state?.message || "Login failed", { duration: 2000 });
    }, [state]);
    return (
        <div className="w-full md:w-1/2 flex items-center justify-center dark:bg-zinc-900 bg-opacity-95 dark:bg-opacity-95 bg-white rounded-l-[60px] shadow-2xl px-10 py-16 relative z-10 backdrop-blur-sm">
            <div className="w-full max-w-md">
                <h2 className="text-4xl text-center font-extrabold dark:text-white text-zinc-900 mb-2 tracking-wide animate-slide-in">
                    👋 Selamat Datang!
                </h2>
                <p className="text-sm text-center dark:text-zinc-400 text-zinc-600 mb-8">
                    Silakan masuk untuk melanjutkan ke dashboard absensi Anda.
                </p>

                <form action={action} className="space-y-5">
                    <div>
                        <label htmlFor="email" className="dark:text-zinc-300 text-zinc-700 text-sm block mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Masukkan Email Anda"
                            className="w-full px-4 py-3 dark:bg-zinc-800 bg-zinc-50 border dark:border-indigo-500 border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white text-zinc-900 dark:placeholder-zinc-400 placeholder-zinc-500 transition duration-150 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="dark:text-zinc-300 text-zinc-700 text-sm block mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            placeholder="••••••••"
                            className="w-full px-4 py-3 dark:bg-zinc-800 bg-zinc-50 border dark:border-indigo-500 border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white text-zinc-900 dark:placeholder-zinc-400 placeholder-zinc-500 transition duration-150 focus:border-indigo-500"
                        />
                    </div>
                    <div className="flex justify-between items-center text-sm dark:text-zinc-400 text-zinc-600">
                        <label className="flex items-center gap-2">
                            <input type="checkbox" className="accent-indigo-500" />
                            Remember me
                        </label>
                        <Link href="./forgot-password" className="dark:text-indigo-400 text-indigo-600 hover:underline transition">
                            Lupa password?
                        </Link>
                    </div>
                    <button
                        type="submit"
                        disabled={pending}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-600 dark:to-indigo-700 light:from-blue-500 light:to-indigo-600 hover:opacity-90 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {pending ? "Memproses..." : "🚀 Masuk Sekarang"}
                    </button>
                </form>

                <div className="flex gap-4 items-center justify-center mt-6">
                    <p className="text-center text-xs text-zinc-500 dark:text-zinc-500 light:text-zinc-500">
                        Belum punya akun?{" "}
                        <Link href="./sign-up" className="text-indigo-400 dark:text-indigo-400 light:text-indigo-600 hover:underline">
                            Daftar Sekarang
                        </Link>
                    </p>
                    <ThemeSwitcher />
                </div>
            </div>
        </div>
    )
}