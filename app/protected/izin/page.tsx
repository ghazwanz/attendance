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
        <div className="w-full max-w-screen-xl mx-auto px-6 py-6 border border-white/20 rounded-xl shadow-lg text-black dark:text-white">
            <ErrorNotification message={errorMessage} onClose={() => setErrorMessage("")} />
            <h1 className="text-3xl font-bold mb-4">📋 Tabel Izin</h1>

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

            {/* Kontrol Header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-600 text-white font-semibold px-4 py-2 rounded w-fit"
                    disabled={showForm}
                    style={showForm ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                >
                    Tambah Izin
                </button>
            </div>

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