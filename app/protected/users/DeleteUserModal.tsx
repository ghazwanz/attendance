import { User } from "@/lib/type";

export default function DeleteUserModal({
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
        <p className="dark:text-gray-300 text-gray-600 mb-4">
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