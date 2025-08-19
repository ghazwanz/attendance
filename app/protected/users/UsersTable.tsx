// app/users/components/UsersTable.tsx
"use client";

import { LucideSearch } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { User } from "@/lib/type";
import { useDebouncedCallback } from "use-debounce";
import UpdatePasswordModal from "./components/UpdatePasswordModal";
import ActionButtons from "./components/ActionButtons"
import EditUserModal from "./EditUserModal";
import CreateUserModal from "./AddUser";
import DeleteUserModal from "./DeleteUserModal";

interface UsersTableProps {
  users: User[];
  currentUser: User;
  createUserAction: (
    formData: FormData
  ) => Promise<{ success: boolean; error?: string }>;
  updateUserAction: (
    formData: FormData
  ) => Promise<{ success: boolean; error?: string }>;
  deleteUserAction: (
    formData: FormData
  ) => Promise<{ success: boolean; error?: string }>;
}

export default function UsersTable({
  users,
  currentUser,
  createUserAction,
  updateUserAction,
  deleteUserAction,
}: UsersTableProps) {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [updatePassModal, setUpdatePassModal] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  const handlerSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
    router.push(`./users?${params.toString()}`);
  }, 200);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    handlerSearch(term);
  };

  const handleCreateUser = async (formData: FormData) => {
    startTransition(async () => {
      const result = await createUserAction(formData);
      if (result.success) {
        setSuccess("User berhasil dibuat");
        setCreateModalOpen(false);
        setError(null);
      } else {
        setError(result.error || "Gagal membuat user");
      }
    });
  };

  const handleUpdateUser = async (formData: FormData) => {
    startTransition(async () => {
      const result = await updateUserAction(formData);
      if (result.success) {
        setSuccess("User berhasil diupdate");
        setEditModalOpen(false);
        setError(null);
      } else {
        setError(result.error || "Gagal mengupdate user");
      }
    });
  };

  const handleDeleteUser = async (formData: FormData) => {
    startTransition(async () => {
      const result = await deleteUserAction(formData);
      if (result.success) {
        setSuccess("User berhasil dihapus");
        setDeleteModalOpen(false);
        setError(null);
      } else {
        setError(result.error || "Gagal menghapus user");
      }
    });
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 min-w-[220px] max-w-[320px]">
          <div className="relative">
            <LucideSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Cari pengguna..."
              className="w-full pl-10 p-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {currentUser?.role === "admin" && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:brightness-110 text-white font-semibold px-5 py-2 rounded-xl shadow"
            disabled={isPending}
          >
            ➕ Tambah Pengguna
          </button>
        )}
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      {/* Table view for desktop */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-white/10 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-inherit text-xs uppercase tracking-wide">
            <tr className="bg-blue-600 text-white uppercase tracking-wider">
              <th className="px-6 py-4 text-left">No</th>
              <th className="px-6 py-4 text-left">Nama</th>
              <th className="px-6 py-4 text-left">Email</th>
              <th className="px-6 py-4 text-left">Peran</th>
              <th className="px-6 py-4 text-left">Tanggal Buat</th>
              <th className="px-6 py-4 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-gray-400 py-6">
                  Tidak ada data pengguna.
                </td>
              </tr>
            ) : (
              users.map((user, index) => (
                <tr
                  key={user.id}
                  className={`transition duration-150 cursor-pointer ${index % 2 === 0
                    ? "bg-white dark:bg-slate-800"
                    : "bg-blue-50 dark:bg-slate-700"
                    } hover:bg-gray-100 dark:hover:bg-slate-600`}
                  onClick={() => (window.location.href = `/protected/users/${user.id}`)}
                >
                  <td className="px-6 py-4 font-medium">{index + 1}</td>
                  <td className="px-6 py-4">{user.name}</td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${user.role === "admin"
                        ? "bg-red-100 text-red-600"
                        : "bg-blue-100 text-blue-600"
                        }`}
                    >
                      {user.role === "employee" ? "user" : user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {new Date(user.created_at).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-6 py-4 space-x-2">
                    <ActionButtons
                      user={user}
                      currentUser={currentUser}
                      isPending={isPending}
                      setSelectedUser={setSelectedUser}
                      setEditModalOpen={setEditModalOpen}
                      setUpdatePassModal={setUpdatePassModal}
                      setUserToDelete={setUserToDelete}
                      setDeleteModalOpen={setDeleteModalOpen}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create User Modal */}
      {createModalOpen && (
        <CreateUserModal
          onClose={() => setCreateModalOpen(false)}
          onSubmit={handleCreateUser}
          isPending={isPending}
        />
      )}

      {/* Update Password Modal */}
      {updatePassModal && (
        <UpdatePasswordModal
          onClose={() => setUpdatePassModal((prev) => !prev)}
        />
      )}

      {/* Edit User Modal */}
      {editModalOpen && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => setEditModalOpen(false)}
          onSubmit={handleUpdateUser}
          isPending={isPending}
          role={currentUser.role}
        />
      )}

      {/* Delete User Modal */}
      {deleteModalOpen && selectedUser && (
        <DeleteUserModal
          user={selectedUser}
          onClose={() => setDeleteModalOpen(false)}
          onSubmit={handleDeleteUser}
          isPending={isPending}
        />
      )}
    </>
  );
}