'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@/lib/type';

type EditUserModalProps = {
  user: User;
  onClose: () => void;
  onUpdated: () => void;
  updateUserAction: (formData: FormData) => void;
};

const EditUserModal = ({ user, onClose, onUpdated, updateUserAction }: EditUserModalProps) => {
  const supabase = createClient();

  const [name, setName] = useState('');
  const [role, setRole] = useState<'admin' | 'employee'>('employee');
  const [email, setEmail] = useState('Memuat...');
  const [loading, setLoading] = useState(false);

  // Password hanya placeholder
  const [password] = useState(() => {
    const random = Math.random().toString(36).slice(-8);
    return `•••••••${random}`;
  });

  useEffect(() => {
    const fetchUserFromAuth = async () => {
      const { data, error } = await supabase.auth.admin.getUserById(user.id);
      const authUser = data?.user;

      // fallback email
      const fallbackEmail = `user_${user.id.slice(0, 5)}@example.com`;

      if (!authUser || error) {
        setEmail(fallbackEmail);
        setName(user.name || '');
        return;
      }

      const authName = authUser.user_metadata?.name;
      const authRole = authUser.user_metadata?.role;

      setEmail(authUser.email || fallbackEmail);
      setName(authName || user.name || '');
      setRole(authRole || 'employee');
    };

    fetchUserFromAuth();
  }, [supabase, user.id, user.name]);


  const handleSubmit = async () => {
    setLoading(true);

    const formData = new FormData();
    formData.append('id', user.id);
    formData.append('name', name);
    formData.append('role', role);

    try {
      updateUserAction(formData);
      onUpdated();
    } catch (err) {
      console.error('Update failed:', err);
      alert('Gagal memperbarui data user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Edit Pengguna</h2>

        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Nama</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Email (disembunyikan)</label>
          <input
            type="email"
            value={email}
            readOnly
            className="w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white cursor-not-allowed"
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Password (disembunyikan)</label>
          <input
            type="password"
            value={password}
            readOnly
            className="w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white cursor-not-allowed"
          />
        </div>

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
