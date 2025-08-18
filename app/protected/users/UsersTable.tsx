// app/users/components/UsersTable.tsx
"use client";

import { LucideSearch } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { User } from "@/lib/type";
import { useDebouncedCallback } from "use-debounce";
import UpdatePasswordModal from "./components/UpdatePasswordModal";

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
  }, 300);

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
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-white/10 overflow-x-auto hidden sm:block">
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

      {/* Card view for mobile */}
      <div className="sm:hidden space-y-4">
        {users.length === 0 ? (
          <p className="text-center text-gray-400 py-6">Tidak ada data pengguna.</p>
        ) : (
          users.map((user, index) => (
            <div
              key={user.id}
              className="p-4 rounded-xl shadow bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10"
              onClick={() => (window.location.href = `/protected/users/${user.id}`)}
            >
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold">{user.name}</h4>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${user.role === "admin"
                      ? "bg-red-100 text-red-600"
                      : "bg-blue-100 text-blue-600"
                    }`}
                >
                  {user.role === "employee" ? "user" : user.role}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">📧 {user.email}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                📅 {new Date(user.created_at).toLocaleDateString("id-ID")}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
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
              </div>
            </div>
          ))
        )}
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

     
        
    </>
  );
}

// Reusable Action Buttons (biar nggak dobel kode)
function ActionButtons({
  user,
  currentUser,
  isPending,
  setSelectedUser,
  setEditModalOpen,
  setUpdatePassModal,
  setUserToDelete,
  setDeleteModalOpen,
}: any) {
  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setSelectedUser(user);
          setEditModalOpen(true);
        }}
        className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-full text-xs font-semibold shadow"
        disabled={isPending}
      >
        ✏️ Edit
      </button>
      {user.id === currentUser.id && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setUpdatePassModal((prev: boolean) => !prev);
          }}
          className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-full text-xs font-semibold shadow"
          disabled={isPending}
        >
          ✏️ Change Password
        </button>
      )}
      {currentUser?.role === "admin" && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setUserToDelete(user);
            setDeleteModalOpen(true);
          }}
          className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-full text-xs font-semibold shadow"
          disabled={isPending}
        >
          🗑 Hapus
        </button>
      )}
    </>
  );
}

// Create User Modal
function CreateUserModal({
  onClose,
  onSubmit,
  isPending,
}: {
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
  isPending: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Tambah Pengguna Baru</h3>
        <form action={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nama</label>
            <input
              type="text"
              name="name"
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              name="password"
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              name="role"
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isPending ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit User Modal
function EditUserModal({
  user,
  onClose,
  onSubmit,
  isPending,
  role,
}: {
  user: User;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
  isPending: boolean;
  role: "admin" | "employee";
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Edit Pengguna</h3>
        <form action={onSubmit} className="space-y-4">
          <input type="hidden" name="userId" value={user.id} />
          <div>
            <label className="block text-sm font-medium mb-1">Nama</label>
            <input
              type="text"
              name="name"
              defaultValue={user.name}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              defaultValue={user.email}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {role === "admin" && (
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select
                name="role"
                defaultValue={user.role}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}


              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
            >
              {isPending ? "Menghapus..." : "Hapus"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
