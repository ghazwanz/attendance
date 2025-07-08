import React from "react";

export default function page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0C0B0E] ">
      <div className="bg-[#161518] border-[#ffffff25] border p-8 rounded-xl shadow-lg w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">
          Login Sistem
        </h2>
        <form>
          <input
            type="text"
            placeholder="Username/Email"
            className="w-full mb-4 px-4 py-2 border border-gray-300 rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full mb-4 px-4 py-2 border border-gray-300 rounded"
            required
          />         
          <input
            type="number"
            placeholder="phone number"
            className="w-full mb-4 px-4 py-2 border border-gray-300 rounded"
            required
          />

          <button
            type="submit"
            className="w-full bg-[#C1F200] text-black py-2 rounded transition duration-200"
          >
            Masuk
          </button>
        </form>
      </div>
    </div>
  );
}
