import React from 'react'

export type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const Modal = ({ isOpen, onClose, children }: ModalProps) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 bg-opacity-50 z-50">
            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg shadow-lg max-w-md w-full p-6 relative">
                <button
                    onClick={onClose}
                    aria-label="Close"
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                >
                    ✖
                </button>
                {children}
            </div>
        </div>
    )
}

export default Modal