import React from "react";

export default function page() {
  return (
       <div className="flex min-h-screen bg-gradient-to-r from-fuchsia-500 to-indigo-500 relative overflow-hidden">
      {/* KIRI - ILUSTRASI */}
      <div className="hidden md:flex w-1/2 items-center justify-center relative">
        {/* Logo di atas */}
        <img
          src="	https://siprakerin.com/assets/images/logo2.png"
          alt="SIPRAKERIN Logo"
          className="absolute top-8 left-8 w-14"
        />
        {/* Gambar Ilustrasi */}
        <img
          src="https://siprakerin.com/assets/images/auth/login.svg"
          alt="Login Illustration"
          className="w-[320px]"
        />
      </div>

      {/* KANAN - FORM LOGIN TEGAK */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white rounded-l-[60px] shadow-2xl px-10 py-16">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-indigo-700 mb-2">SIGN IN</h2>
          <p className="text-sm text-gray-600 mb-6">
            Masukkan Email, Username, NISN, NIP, atau No. Telp dan password untuk login
          </p>
          <form className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Email, Username, NISN, NIP, atau No. Telp"
                className="w-full px-4 py-3 bg-white border border-indigo-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Masukkan Password"
                className="w-full px-4 py-3 bg-white border border-indigo-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-indigo-600 text-white font-semibold rounded-lg hover:opacity-90 transition text-sm"
            >
              SIGN IN
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}