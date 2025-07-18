'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@/lib/type';

type EditUserModalProps = {
  user: User;
  onClose: () => void;
  onUpdated: () => void;
};

const EditUserModal = ({ user, onClose, onUpdated }: EditUserModalProps) => {
  const supabase = createClient();

  const [name, setName] = useState(user.name ?? '');
  const [role, setRole] = useState(user.role ?? 'employee');

  const [email, setEmail] = useState(user.email ?? 'Memuat...');
  const [password] = useState(() => {
    const random = Math.random().toString(36).slice(-8);
    return `•••••••${random}`;
  });

  const [loading, setLoading] = useState(false);

  // Ambil email dari Supabase Auth jika tidak tersedia
  useEffect(() => {
    const fetchEmail = async () => {
      if (!user.email) {
        const { data, error } = await supabase.auth.admin.getUserById(user.id);
        if (data?.user?.email) {
          setEmail(data.user.email);
        } else {
          setEmail('********');
        }
      }
    };

    fetchEmail();
  }, [supabase, user]);

  const handleSubmit = async () => {
    setLoading(true);

    const { error: userTableError } = await supabase
      .from('users')
      .update({ name, role })
      .eq('id', user.id);

    setLoading(false);

    if (!userTableError) {
      onUpdated();
    } else {
      console.error('User Table Error:', userTableError);
      alert(userTableError?.message ?? 'Gagal memperbarui data user');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Edit Pengguna</h2>

        {/* Nama */}
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Nama</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Email */}
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Email (disembunyikan)</label>
          <input
            type="email"
            value={email}
            readOnly
            className="w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white cursor-not-allowed"
          />
        </div>

        {/* Password */}
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Password (disembunyikan)</label>
          <input
            type="password"
            value={password}
            readOnly
            className="w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white cursor-not-allowed"
          />
        </div>

        {/* Role */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as 'admin' | 'employee')}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
          >
            <option value="admin">Admin</option>
            <option value="employee">Employee</option>
          </select>
        </div>

        {/* Tombol */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
          <button
            onClick={onClose}
            className="ml-3 text-sm text-gray-500"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;
