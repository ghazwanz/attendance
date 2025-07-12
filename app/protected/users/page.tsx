'use client';

import { createClient } from '@/lib/supabase/client';
import { LucidePencil, Plus, Trash2 } from 'lucide-react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import EditUserModal from './EditUserModal';
import DeleteUserModal from './DeleteUserModal'; // ✅ Tambah ini
import { User } from '@/lib/type';

const Page = () => {
  const supabase = createClient();

  const [userData, setUserData] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false); // ✅
  const [userToDelete, setUserToDelete] = useState<User | null>(null); // ✅

  useEffect(() => {
    const fetchData = async () => {
      const { data: authUser } = await supabase.auth.getUser();
      if (!authUser?.user) return redirect('/auth/login');

      const { data: currentUser, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.user.id)
        .single();

      if (error || !currentUser) return redirect('/auth/login');

      setUserData(currentUser);

      if (currentUser.role === 'admin') {
        const { data: allUsers } = await supabase.from('users').select('*');
        setUsers(allUsers ?? []);
      } else {
        setUsers([currentUser]);
      }
    };

    fetchData();
  }, []);

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const openDeleteModal = (user: User) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const handleUserUpdated = async () => {
    if (userData?.role === 'admin') {
      const { data } = await supabase.from('users').select('*');
      setUsers(data ?? []);
    }
    setEditModalOpen(false);
  };

  const handleUserDeleted = (deletedId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== deletedId));
    setDeleteModalOpen(false);
  };

  return (
    <div className="rounded-2xl shadow-lg dark:shadow-white/20 p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">📋 Tabel User</h2>
          <p className="text-gray-500 mt-1">Data pengguna yang terdaftar di sistem</p>
        </div>

        {userData?.role === 'admin' && (
          <Link
            href="input_user"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Tambah Pengguna
          </Link>
        )}
      </div>

      {/* Tabel */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-inherit text-xs uppercase tracking-wide">
            <tr>
              <th className="px-6 py-4 text-left">No</th>
              <th className="px-6 py-4 text-left">Nama</th>
              <th className="px-6 py-4 text-left">Role</th>
              <th className="px-6 py-4 text-left">Tanggal Buat</th>
              {userData?.role === 'admin' && (
                <th className="px-6 py-4 text-left">Action</th>
              )}
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-gray-400 py-6">
                  Tidak ada data pengguna.
                </td>
              </tr>
            ) : (
              users.map((user, index) => (
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
                  {userData?.role === 'admin' && (
                    <td className="px-6 py-4 space-x-2">
                      <button
                        onClick={() => openDeleteModal(user)}
                        className="inline-flex items-center gap-1 bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1.5 rounded-full text-xs transition"
                      >
                        <Trash2 className="w-4 h-4" />
                        Hapus
                      </button>
                      <button
                        onClick={() => openEditModal(user)}
                        className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-600 hover:bg-yellow-200 px-3 py-1.5 rounded-full text-xs transition"
                      >
                        <LucidePencil className="w-4 h-4" />
                        Edit
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Edit */}
      {editModalOpen && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => setEditModalOpen(false)}
          onUpdated={handleUserUpdated}
        />
      )}

      {/* Modal Delete */}
      {deleteModalOpen && userToDelete && (
        <DeleteUserModal
          user={userToDelete}
          onClose={() => setDeleteModalOpen(false)}
          onDeleted={handleUserDeleted}
        />
      )}
    </div>
  );
};

export default Page;