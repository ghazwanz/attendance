import { User } from "@/lib/type";

export type ActionButtonsProps = {
    user:User;
    currentUser:User;
    isPending: boolean;
    setSelectedUser: (user: User) => void;
    setEditModalOpen: (open: boolean) => void;
    setUpdatePassModal: (open: boolean) => void;
    setUserToDelete: (user: User) => void;
    setDeleteModalOpen: (open: boolean) => void;
}

export default function ActionButtons({
    user,
    currentUser,
    isPending,
    setSelectedUser,
    setEditModalOpen,
    setUpdatePassModal,
    setUserToDelete,
    setDeleteModalOpen,
}: ActionButtonsProps) {
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