"use client";
import React from "react";

export default function Page() {
  return (
    <div className="flex min-h-screen bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden font-sans">
      
      {/* KIRI - ILUSTRASI YANG DIPERCANTIK */}
      <div className="hidden md:flex w-1/2 items-center justify-center relative bg-gradient-to-br from-[#1e1e2f] via-[#23233b] to-[#1e1e2f] overflow-hidden">
        {/* Logo */}
        <img
          src="/logo1.png"
          alt="MAHATIVE Logo"
          className="absolute top-8 left-8 w-14 drop-shadow-md z-10"
        />

        {/* Efek Lingkaran Latar */}
        <div className="absolute -top-16 -left-16 w-96 h-96 bg-indigo-700 rounded-full opacity-20 blur-3xl z-0 animate-ping" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500 rounded-full opacity-20 blur-2xl z-0 animate-pulse" />

        {/* Ilustrasi & Teks */}
        <div className="relative z-10 flex flex-col items-center text-center animate-fade-in-up">
          <img
            src="https://siprakerin.com/assets/images/auth/login.svg"
            alt="Login Illustration"
            className="w-[320px] drop-shadow-2xl transition-transform hover:scale-105 duration-300"
          />
          <p className="text-zinc-200 text-sm mt-6 px-6">
            Masuk dengan aman dan nyaman 🚀<br />
            Lindungi datamu, tetap produktif!
          </p>
        </div>
      </div>

      {/* KANAN - FORM LOGIN */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-zinc-900 rounded-l-[60px] shadow-2xl px-10 py-16 relative z-10">
        <div className="w-full max-w-md">
          <h2 className="text-4xl font-extrabold text-white mb-2 tracking-wide animate-slide-in">
            👋 Selamat Datang!
          </h2>
          <p className="text-sm text-zinc-400 mb-8">
            Silakan masuk untuk melanjutkan ke dashboard absensi Anda.
          </p>

          <form className="space-y-5">
            <div>
              <label className="text-zinc-300 text-sm block mb-1">
                Username
              </label>
              <input
                type="text"
                placeholder="Masukkan Username Anda"
                className="w-full px-4 py-3 bg-zinc-800 border border-indigo-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-zinc-400 transition duration-150"
              />
            </div>
            <div>
              <label className="text-zinc-300 text-sm block mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-zinc-800 border border-indigo-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-zinc-400 transition duration-150"
              />
            </div>
            <div className="flex justify-between items-center text-sm text-zinc-400">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-indigo-500" />
                Remember me
              </label>
              <a href="#" className="text-indigo-400 hover:underline">
                Lupa password?
              </a>
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:opacity-90 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              🚀 Masuk Sekarang
            </button>
          </form>

          <p className="text-center text-xs text-zinc-500 mt-6">
            Belum punya akun?{" "}
            <a href="#" className="text-indigo-400 hover:underline">
              Daftar Sekarang
            </a>
          </p>
        </div>
      </div>

      {/* ANIMASI LATAR GLOKAL */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-700 rounded-full blur-3xl opacity-30 animate-pulse -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-20 animate-pulse -z-10" />
    </div>
  );
}
