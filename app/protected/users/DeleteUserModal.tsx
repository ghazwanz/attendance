'use client';

import { User } from '@/lib/type';
import { useState } from 'react';

type DeleteUserModalProps = {
  user: User;
  onClose: () => void;
  onDeleted: (id: string) => void;
};

const DeleteUserModal = ({ user, onClose, onDeleted }: DeleteUserModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);

    const res = await fetch('/api/delete-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      alert('Gagal menghapus: ' + data.error);
      return;
    }

    onDeleted(user.id);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-lg">
        <h2 className="text-lg font-semibold mb-4 text-red-600">Hapus Pengguna</h2>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-6">
          Yakin ingin menghapus <strong>{user.name}</strong>?
        </p>

        <div className="flex justify-end">
          <button
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
          >
            {loading ? 'Menghapus...' : 'Ya, Hapus'}
          </button>
          <button
            onClick={onClose}
            className="ml-3 text-sm text-gray-500 hover:underline"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteUserModal;