// components/PermissionPage.tsx
"use client";

import React from "react";
import { usePermissions } from "./hook/usePermissions";
import PermissionForm from "./components/PermissionForm";
import ErrorNotification from "./components/ErrorNotification";
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
        errorMessage,
        setErrorMessage,
    } = usePermissions();

    return (
        <div>
            <ErrorNotification message={errorMessage} onClose={() => setErrorMessage("")} />
            
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

            {/* Modal Tambah Izin */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 w-full max-w-lg relative">
                        <button
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-white text-2xl font-bold"
                            onClick={() => { setShowForm(false); resetForm(); }}
                            aria-label="Tutup"
                        >
                            ×
                        </button>
                        <h2 className="text-xl font-semibold mb-4">Tambah Izin</h2>
                        <PermissionForm
                            form={form}
                            users={users}
                            currentUser={currentUser}
                            loading={loading}
                            onSubmit={handleSubmit}
                            onChange={handleFormChange}
                        />
                    </div>
                </div>
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