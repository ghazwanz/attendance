"use client";

import { useRouter } from "next/navigation"; // ⬅ pakai router
import { useState } from "react";
import { Mail } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-gray-100 dark:bg-gray-950">
      <ForgotPasswordForm />
    </div>
  );
}

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter(); // ⬅ router Next.js

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      alert("📧 Link reset password sudah dikirim ke email Anda!");

      // simulasi klik link dari email
      router.push("/auth/update-password"); // ⬅ pindah ke halaman ganti password
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl w-full max-w-md"
    >
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
        🔑 Reset Your Password
      </h2>
      <p className="text-gray-500 dark:text-gray-400 text-center mt-1 mb-6 text-sm">
        Masukkan email Anda, kami akan mengirimkan link reset password
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
          <input
            type="email"
            placeholder="Email Anda"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
                       focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
                       dark:bg-gray-800 dark:text-white"
          />
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.02 }}
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-lg font-semibold shadow-lg transition-colors duration-200 
            ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"} 
            text-white`}
        >
          {loading ? "Mengirim..." : "Kirim Link Reset"}
        </motion.button>
      </form>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
        Sudah punya akun?{" "}
        <Link href="/auth/login" className="text-blue-600 dark:text-blue-400 hover:underline">
          Login
        </Link>
      </p>
    </motion.div>
  );
}
