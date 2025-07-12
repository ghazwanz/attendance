'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@/lib/type';

type EditUserModalProps = {
  user: User;
  onClose: () => void;
  onUpdated: () => void;
};

const EditUserModal = ({ user, onClose, onUpdated }: EditUserModalProps) => {
  const supabase = createClient();

  const [name, setName] = useState(user.name);
  const [role, setRole] = useState(user.role);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);

    const { error } = await supabase
      .from('users')
      .update({ name, role })
      .eq('id', user.id);

    setLoading(false);

    if (!error) {
      onUpdated(); // Berhasil update
    } else {
      alert('Gagal memperbarui data');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Edit Pengguna</h2>

        {/* Input Nama */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Nama</label>
          <input
            type="text"
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Select Role */}
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