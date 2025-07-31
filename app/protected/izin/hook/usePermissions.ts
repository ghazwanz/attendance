// hooks/usePermissions.ts
"use client";

import { useState, useEffect } from "react";
import { Permission, User, PermissionForm } from "../lib/types";
import { permissionActions } from "../action/permission-action";

const initialForm: PermissionForm = {
    user_id: "",
    exit_time: "",
    reentry_time: "",
    reason: "",
};

export function usePermissions() {
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [currentUser, setCurrentUser] = useState<{ id: string; role: string } | null>(null);
    const [form, setForm] = useState<PermissionForm>(initialForm);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    // Modal states
    const [showForm, setShowForm] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedIdToDelete, setSelectedIdToDelete] = useState<string | null>(null);

    // Search state
    const [searchTerm, setSearchTerm] = useState("");

    // Initialize data
    useEffect(() => {
        const init = async () => {
            try {
                const user = await permissionActions.fetchCurrentUser();
                setCurrentUser(user);
            } catch (error) {
                console.error("Error fetching current user:", error);
            }
        };
        init();
    }, []);

    useEffect(() => {
        if (currentUser) {
            fetchData();
            fetchUsers();
        }
    }, [currentUser]);

    const fetchData = async () => {
        try {
            const data = await permissionActions.fetchPermissions(currentUser);
            setPermissions(data);
        } catch (error) {
            console.error("Error fetching permissions:", error);
        }
    };

    const fetchUsers = async () => {
        try {
            const data = await permissionActions.fetchUsers();
            setUsers(data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const resetForm = () => {
        setForm(initialForm);
        setEditingId(null);
    };

    const showSuccessMessage = (message: string) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(""), 3000);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Backend-side validation: exit_time must be <= reentry_time
        if (form.exit_time && form.reentry_time) {
            const exit = new Date(form.exit_time);
            const reentry = new Date(form.reentry_time);
            if (reentry < exit) {
                alert("Waktu Masuk Kembali harus sama atau setelah Mulai Izin.");
                return;
            }
        }

        setLoading(true);
        try {
            if (editingId) {
                await permissionActions.updatePermission(editingId, form);
                showSuccessMessage("✅ Berhasil mengedit izin!");
                setShowEditModal(false);
            } else {
                await permissionActions.createPermission(form);
                showSuccessMessage("✅ Berhasil menambahkan izin!");
                setShowForm(false);
            }
            resetForm();
            fetchData();
        } catch (error) {
            console.error("Error submitting form:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item: Permission) => {
        setForm({
            user_id: item.user_id,
            exit_time: item.exit_time,
            reentry_time: item.reentry_time,
            reason: item.reason,
        });
        setEditingId(item.id);
        setShowEditModal(true);
    };

    const confirmDelete = (id: string) => {
        if (currentUser?.role !== "admin") {
            alert("❌ Anda tidak memiliki izin untuk menghapus data.");
            return;
        }
        setSelectedIdToDelete(id);
        setShowConfirmModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedIdToDelete) return;

        setLoading(true);
        try {
            await permissionActions.deletePermission(selectedIdToDelete);
            showSuccessMessage("✅ Data berhasil dihapus!");
            fetchData();
        } catch (error) {
            console.error("Error deleting permission:", error);
        } finally {
            setLoading(false);
            setShowConfirmModal(false);
            setSelectedIdToDelete(null);
        }
    };

    // Filter permissions based on search term
    const filteredPermissions = permissions.filter((item) => {
        const nama = item.user?.name?.toLowerCase() || "";
        const alasan = item.reason.toLowerCase();
        const keyword = searchTerm.toLowerCase();

        return (
            nama.includes(keyword) ||
            alasan.includes(keyword)
        );
    });

    return {
        // Data
        permissions: filteredPermissions,
        users,
        currentUser,
        form,
        loading,
        successMessage,

        // Modal states
        showForm,
        showEditModal,
        showConfirmModal,

        // Search
        searchTerm,
        setSearchTerm,

        // Actions
        handleFormChange,
        handleSubmit,
        handleEdit,
        confirmDelete,
        handleDeleteConfirm,
        resetForm,

        // Modal controls
        setShowForm,
        setShowEditModal: (show: boolean) => {
            setShowEditModal(show);
            if (!show) resetForm();
        },
        setShowConfirmModal,
    };
}