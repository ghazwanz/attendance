import React from "react";

export default function page() {
  return (
    <div className="flex min-h-screen bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">

      {/* KIRI - ILUSTRASI */}
      <div className="hidden md:flex w-1/2 items-center justify-center relative">
        {/* Logo */}
        <img
          src="/logo1.png"
          alt="MAHATIVE Logo"
          className="absolute top-8 left-8 w-14"
        />

        {/* Gambar Ilustrasi */}
        <img
          src="https://siprakerin.com/assets/images/auth/login.svg"
          alt="Login Illustration"
          className="w-[320px] drop-shadow-lg"
        />
      </div>

      {/* KANAN - FORM LOGIN */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-zinc-900 rounded-l-[60px] shadow-2xl px-10 py-16">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-white mb-2">SIGN IN</h2>
          <p className="text-sm text-zinc-400 mb-6">
            Masukkan Username dan password untuk login
          </p>

          <form className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Username"
                className="w-full px-4 py-3 bg-zinc-800 border border-indigo-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-zinc-400"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Masukkan Password"
                className="w-full px-4 py-3 bg-zinc-800 border border-indigo-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-zinc-400"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-700 text-white font-semibold rounded-lg hover:opacity-90 transition text-sm"
            >
              SIGN IN
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
