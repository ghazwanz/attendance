import { createClient } from '@/lib/supabase/server';
import { LucidePencil, Plus, Trash2 } from 'lucide-react';
import { redirect } from 'next/navigation';
import Link from 'next/link';

const page = async () => {
  const supabase = await createClient();

  // 🔐 Ambil user login
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const userId = user.id;

  // Ambil data user login dari tabel 'users'
  const { data: userData, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single(); // ambil satu user saja

  if (error) {
    console.error(error);
    redirect("/auth/login");
  }

  return (
    <div className="rounded-2xl shadow-lg dark:shadow-white/20 p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">📋 Tabel User</h2>
          <p className="text-gray-500 mt-1">Data pengguna yang terdaftar di sistem</p>
        </div>

        {/* ✅ Tombol hanya muncul jika role-nya admin */}
        {userData.role === 'admin' && (
          <Link
            href="input_user"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Tambah Pengguna
          </Link>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-inherit text-xs uppercase tracking-wide">
            <tr>
              <th className="px-6 py-4 text-left">No</th>
              <th className="px-6 py-4 text-left">Nama</th>
              <th className="px-6 py-4 text-left">Role</th>
              <th className="px-6 py-4 text-left">Tanggal Buat</th>
              <th className="px-6 py-4 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {[userData].map((user, index) => (
              <tr
                key={user.id}
                className={`${index % 2 === 0 ? 'bg-white dark:bg-inherit' : 'bg-gray-50 dark:bg-gray-900'
                  } border-t hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-150`}
              >
                <td className="px-6 py-4 font-medium">{index + 1}</td>
                <td className="px-6 py-4">{user.name}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${user.role === 'admin'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-blue-100 text-blue-600'
                      }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {new Date(user.created_at).toLocaleDateString('id-ID')}
                </td>
                {/* ✅ Action hanya muncul jika admin */}
                {userData.role === 'admin' && (
                  <td className="px-6 py-4 space-x-2">
                    <button className="inline-flex items-center gap-1 bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1.5 rounded-full text-xs transition">
                      <Trash2 className="w-4 h-4" />
                      Hapus
                    </button>
                    <button className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-600 hover:bg-yellow-200 px-3 py-1.5 rounded-full text-xs transition">
                      <LucidePencil className="w-4 h-4" />
                      Edit
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default page;