// components/PermissionPage.tsx
"use client";

import React from "react";
import { usePermissions } from "./hook/usePermissions";
import PermissionForm from "./components/PermissionForm";
import PermissionTable from "./components/PermissionTable";
import EditPermissionModal from "./components/EditPermissionModal";
import DeleteConfirmModal from "./components/DeleteModal";

export default function PermissionPage() {
    const {
        permissions,
        users,
        currentUser,
        form,
        loading,
        successMessage,
        showForm,
        showEditModal,
        showConfirmModal,
        searchTerm,
        setSearchTerm,
        handleFormChange,
        handleSubmit,
        handleEdit,
        confirmDelete,
        handleDeleteConfirm,
        resetForm,
        setShowForm,
        setShowEditModal,
        setShowConfirmModal,
    } = usePermissions();

    return (
        <div className="w-full max-w-screen-xl mx-auto px-6 py-6 border border-white/20 rounded-xl shadow-lg text-black dark:text-white">
            <h1 className="text-3xl font-bold mb-4">📋 Tabel Izin</h1>

            {successMessage && (
                <div className="mb-4 bg-green-600 text-white px-4 py-2 rounded-md shadow-sm">
                    {successMessage}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={showConfirmModal}
                onConfirm={handleDeleteConfirm}
                onCancel={() => setShowConfirmModal(false)}
                loading={loading}
            />

            {/* Edit Modal */}
            <EditPermissionModal
                isOpen={showEditModal}
                form={form}
                users={users}
                currentUser={currentUser}
                loading={loading}
                onSubmit={handleSubmit}
                onChange={handleFormChange}
                onClose={() => setShowEditModal(false)}
            />

            {/* Header Controls */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <button
                    onClick={() => {
                        setShowForm(!showForm);
                        if (showForm) resetForm();
                    }}
                    className="bg-blue-600 text-white font-semibold px-4 py-2 rounded w-fit"
                >
                    {showForm ? "Tutup Form" : "Tambah Izin"}
                </button>
            </div>

            {/* Add Form */}
            {showForm && (
                <PermissionForm
                    form={form}
                    users={users}
                    currentUser={currentUser}
                    loading={loading}
                    onSubmit={handleSubmit}
                    onChange={handleFormChange}
                />
            )}

            {/* Permissions Table */}
            <PermissionTable
                data={permissions}
                currentUser={currentUser}
                onEdit={handleEdit}
                onDelete={confirmDelete}
                loading={loading}
            />
        </div>
    );
}