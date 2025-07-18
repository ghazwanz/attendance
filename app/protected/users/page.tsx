'use client';

import { createClient } from '@/lib/supabase/client';
import { LucidePencil, Plus, Trash2, LucideSearch } from 'lucide-react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import EditUserModal from './EditUserModal';
import DeleteUserModal from './DeleteUserModal';
import { User } from '@/lib/type';
import AddUser from './AddUser';

const Page = () => {
  const supabase = createClient();

  const [userData, setUserData] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); // 🔍 state pencarian

  useEffect(() => {
    const fetchData = async () => {
      const { data: authUser } = await supabase.auth.getUser();
      if (!authUser?.user) return redirect('/auth/login');

      const { data: currentUserData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.user.id)
        .single();

      if (error || !currentUserData) return redirect('/auth/login');

      // 🔁 Ambil email dari auth.users
      const { data: authUserData } = await supabase.auth.getUser();

      const currentUser: User = {
        ...currentUserData,
        email: authUserData?.user?.email ?? '', // tambahkan email
        password: '', // dummy password
      };


      if (error || !currentUser) return redirect('/auth/login');

      setUserData(currentUser);

      if (currentUser.role === 'admin') {
        const { data: allUsersRaw } = await supabase.from('users').select('*');

        const { data: allAuthUsers } = await supabase.auth.admin.listUsers();

        const mergedUsers: User[] = (allUsersRaw ?? []).map((user) => {
          const matchingAuth = allAuthUsers?.users.find((u) => u.id === user.id);
          return {
            ...user,
            email: matchingAuth?.email ?? '',
            password: '', // password tetap disembunyikan
          };
        });

        setUsers(mergedUsers);

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

  // Memoised hasil filter agar lebih efisien
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;
    const term = searchTerm.toLowerCase();
    return users.filter((u) =>
      [u.name, u.role].some((field) => field?.toLowerCase().includes(term))
    );
  }, [searchTerm, users]);

  return (
    <div className="rounded-2xl shadow-lg dark:shadow-white/20 p-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">📋 Tabel User</h2>
          <p className="text-gray-500 mt-1">Data pengguna yang terdaftar di sistem</p>
        </div>

        {/* Search Bar */}
        <div className="flex-1 min-w-[220px] max-w-[320px] mx-auto">
          <div className="relative">
            <LucideSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari pengguna..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {userData?.role === 'admin' && (
          <button
            onClick={() => setCreateModalOpen((prev) => !prev)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Tambah Pengguna
          </button>
        )}
      </div>

      {/* Tabel */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
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
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-gray-400 py-6">
                  Tidak ada data pengguna.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user, index) => (
                <tr
                  key={user.id}
                  className={`${index % 2 === 0 ? 'bg-white dark:bg-inherit' : 'bg-gray-50 dark:bg-gray-900'} border-t hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-150`}
                >
                  <td className="px-6 py-4 font-medium">{index + 1}</td>
                  <td className="px-6 py-4">{user.name}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${user.role === 'admin' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}
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

      {/* Modal Create */}
      {createModalOpen && (
        <AddUser onClose={() => setCreateModalOpen(false)} onDeleted={handleUserDeleted} />
      )}
    </div>
  );
};

export default Page;
