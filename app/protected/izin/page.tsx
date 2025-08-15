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

            <PermissionForm
                isOpen={showForm}
                form={form}
                users={users}
                currentUser={currentUser}
                loading={loading}
                onSubmit={handleSubmit}
                onChange={handleFormChange}
                onClose={() => setShowForm(false)}
            />

            {/* Permissions Table */}
            <PermissionTable
                data={permissions}
                currentUser={currentUser}
                onEdit={handleEdit}
                onDelete={confirmDelete}
                loading={loading}
                onCreate={()=>setShowForm(true)}
            />
        </div>
    );
}