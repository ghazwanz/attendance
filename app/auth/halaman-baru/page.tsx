import React from "react";

export default function page() {
  return (
      <div className="flex min-h-screen bg-gradient-to-r from-fuchsia-500 to-indigo-500">
      {/* KIRI - GAMBAR */}
      <div className="w-1/2 hidden md:flex items-center justify-center">
        <img
          src="https://i.pinimg.com/736x/c0/99/15/c099159849a5f3399e05335f2c56adca.jpg"
          alt="Login Illustration"
          className="w-3/4"
        />
      </div>

      {/* KANAN - FORM LOGIN */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white rounded-l-3xl shadow-xl px-10">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-indigo-700 mb-2">SIGN IN</h2>
          <p className="text-gray-600 mb-6 text-sm">
            Masukkan Username,dan password untuk login
          </p>
          <form className="space-y-4">
            <div>
              <label className="block text-sm mb-1 font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                placeholder="Username"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm mb-1 font-medium text-gray-700">Password</label>
              <input
                type="password"
                placeholder="Masukkan Password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-gradient-to-r from-pink-500 to-indigo-600 text-white font-semibold rounded-lg hover:opacity-90 transition"
            >
              SIGN IN
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
