// app/users/components/UsersTable.tsx
"use client";

import { LucidePencil, Plus, Trash2, LucideSearch } from "lucide-react";
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
        <form method="GET" className="mb-4 flex flex-wrap items-center gap-3">
          <input
            type="text"
            name="search"
            placeholder="Cari nama atau role..."
            defaultValue={searchTerm || ''}
            className="border px-3 py-1 rounded-md"
          />
          {/* Removed day filter dropdown as 'day' and 'dayNames' are not defined */}
          <button type="submit" className="bg-blue-500 text-white px-4 py-1 rounded-md">
            Filter
          </button>
        </form>

        <div className="flex-1 min-w-[220px] max-w-[320px] mx-auto">
          <div className="relative">
            <LucideSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Cari pengguna..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-white/10">
        <table className="min-w-full text-sm">
          <thead className="bg-inherit text-xs uppercase tracking-wide">
            <tr className="bg-blue-600 text-white uppercase tracking-wider">
              <th className="px-6 py-4 text-left">No</th>
              <th className="px-6 py-4 text-left">Nama</th>
              <th className="px-6 py-4 text-left">Email</th>
              <th className="px-6 py-4 text-left">Role</th>
              <th className="px-6 py-4 text-left">Tanggal Buat</th>
              <th className="px-6 py-4 text-left">Action</th>
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
                  className={`transition duration-150 ${index % 2 === 0
                    ? "bg-white dark:bg-slate-800"
                    : "bg-blue-50 dark:bg-slate-700"
                    } hover:bg-gray-100 dark:hover:bg-slate-600`}
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
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setEditModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-full text-xs font-semibold shadow"
                      disabled={isPending}
                    >
                      ✏️ Edit
                    </button>
                    {user.id === currentUser.id &&
                      <button
                        onClick={() => { setUpdatePassModal(prev => !prev) }}
                        className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-full text-xs font-semibold shadow"
                        disabled={isPending}
                      >
                        ✏️ Change Password
                      </button>
                    }
                    {currentUser?.role === "admin" && (
                      <button
                        onClick={() => {
                          setUserToDelete(user);
                          setDeleteModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-full text-xs font-semibold shadow"
                        disabled={isPending}
                      >
                        🗑 Delete
                      </button>
                    )}
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

      {/* Create User Modal */}
      {updatePassModal && (
        <UpdatePasswordModal
          onClose={() => setUpdatePassModal((prev)=>!prev)}
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
      {deleteModalOpen && userToDelete && (
        <DeleteUserModal
          user={userToDelete!}
          onClose={() => setDeleteModalOpen(false)}
          onSubmit={handleDeleteUser}
          isPending={isPending}
        />
      )}
    </>
  );
}

// Create User Modal Component
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

// Edit User Modal Component
function EditUserModal({
  user,
  onClose,
  onSubmit,
  isPending,
  role
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
            <label className="block text-sm font-medium mb-1">Nama</label>
            <input
              type="email"
              name="email"
              defaultValue={user.email}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {role === "admin" &&
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
          }
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
              {isPending ? "Menyimpan..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Delete User Modal Component
function DeleteUserModal({
  user,
  onClose,
  onSubmit,
  isPending,
}: {
  user: User;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
  isPending: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Hapus Pengguna</h3>
        <p className="text-gray-600 mb-4">
          Apakah Anda yakin ingin menghapus pengguna{" "}
          <strong>{user.name}</strong>?
        </p>
        <form action={onSubmit} className="flex gap-2 justify-end">
          <input type="hidden" name="userId" value={user.id} />
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
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
          >
            {isPending ? "Menghapus..." : "Hapus"}
          </button>
        </form>
      </div>
    </div>
  );
}
