import React from "react";

export default function page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-cyan-400">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Login Sistem
        </h2>
        <form>
          <input
            type="text"
            placeholder="Username"
            className="w-full mb-4 px-4 py-2 border border-gray-300 rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full mb-4 px-4 py-2 border border-gray-300 rounded"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition duration-200"
          >
            Masuk
          </button>
        </form>
      </div>
    </div>
  );
}
