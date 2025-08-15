// "use client";

// import { useState } from "react";
// import { Eye, EyeOff, Lock, Mail } from "lucide-react";
// import { motion } from "framer-motion";
// import { createClient } from "@/lib/supabase/client";
// import { showToast } from "@/lib/utils/toast";

// export default function UpdatePasswordPage() {
//   const supabase = createClient();

//   const [form, setForm] = useState({
//     email: "",
//     newPassword: "",
//     confirmPassword: "",
//   });

//   const [showPassword, setShowPassword] = useState({
//     new: false,
//     confirm: false,
//   });

//   const [loading, setLoading] = useState(false);

//   function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   }

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();

//     if (form.newPassword !== form.confirmPassword) {
//       showToast({type:"error" ,message:"Konfirmasi password tidak cocok!"});
//       return;
//     }

//     setLoading(true);

//     // Update password
//     const { data:resetData } = await supabase.rpc("resetpassword",{ 'user_email': form.email, 'new_plain_password': form.newPassword })

//     setLoading(false);
//     if (resetData !== "success") {
//       showToast({type:"error" ,message:`User dengan Email ${form.email} tidak ditemukan!`});
//       return
//     }
//     showToast({type:"success" ,message:`Password untuk user dengan email ${form.email} berhasil diubah`})

//     setForm({ email: "", newPassword: "", confirmPassword: "" });
//     window.location.href = "/auth/login";
//   }

//   return (
//     <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gray-950">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl w-full max-w-md"
//       >
//         <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
//           🔒 Update Password
//         </h2>
//         <p className="text-gray-500 dark:text-gray-400 text-center mt-1 mb-6 text-sm">
//           Masukkan email dan password baru
//         </p>

//         <form onSubmit={handleSubmit} className="space-y-5">
//           {/* Email */}
//           <div className="relative">
//             <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
//             <input
//               type="email"
//               name="email"
//               placeholder="Email"
//               value={form.email}
//               onChange={handleChange}
//               required
//               className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-800 dark:text-white"
//             />
//           </div>

//           {/* Password Baru */}
//           <div className="relative">
//             <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
//             <input
//               type={showPassword.new ? "text" : "password"}
//               name="newPassword"
//               placeholder="Password Baru"
//               value={form.newPassword}
//               onChange={handleChange}
//               required
//               className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-800 dark:text-white"
//             />
//             <button
//               type="button"
//               onClick={() => setShowPassword((prev) => ({ ...prev, new: !prev.new }))}
//               className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
//             >
//               {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
//             </button>
//           </div>

//           {/* Konfirmasi Password Baru */}
//           <div className="relative">
//             <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
//             <input
//               type={showPassword.confirm ? "text" : "password"}
//               name="confirmPassword"
//               placeholder="Konfirmasi Password Baru"
//               value={form.confirmPassword}
//               onChange={handleChange}
//               required
//               className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-800 dark:text-white"
//             />
//             <button
//               type="button"
//               onClick={() => setShowPassword((prev) => ({ ...prev, confirm: !prev.confirm }))}
//               className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
//             >
//               {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
//             </button>
//           </div>

//           {/* Tombol Submit */}
//           <motion.button
//             whileTap={{ scale: 0.97 }}
//             whileHover={{ scale: 1.02 }}
//             type="submit"
//             disabled={loading}
//             className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-lg transition-colors duration-200 disabled:opacity-50"
//           >
//             {loading ? "Menyimpan..." : "Simpan Perubahan"}
//           </motion.button>
//         </form>
//       </motion.div>
//     </div>
//   );
// }
import { UpdatePasswordForm } from "@/components/update-password-form";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <UpdatePasswordForm />
      </div>
    </div>
  );
}
