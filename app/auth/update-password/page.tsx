"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { motion } from "framer-motion";

export default function UpdatePasswordPage() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      alert("⚠️ Konfirmasi password tidak cocok!");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal mengubah password");
      }

      alert("✅ Password berhasil diubah! Silakan login kembali.");
      window.location.href = "/login"; // redirect ke halaman login
    } catch (error: any) {
      alert("❌ " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gray-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
          🔒 Update Password
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-center mt-1 mb-6 text-sm">
          Masukkan password lama dan buat password baru
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {[
            { name: "newPassword", label: "Password Baru", key: "new" },
            { name: "confirmPassword", label: "Konfirmasi Password Baru", key: "confirm" },
          ].map((field) => (
            <div className="relative" key={field.name}>
              <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input
                type={showPassword[field.key as keyof typeof showPassword] ? "text" : "password"}
                name={field.name}
                placeholder={field.label}
                value={form[field.name as keyof typeof form]}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-800 dark:text-white"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPassword((prev) => ({
                    ...prev,
                    [field.key]: !prev[field.key as keyof typeof showPassword],
                  }))
                }
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword[field.key as keyof typeof showPassword] ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          ))}

          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-lg transition-colors duration-200 disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
