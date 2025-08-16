"use client"
import React, { useActionState, useEffect } from 'react'
import { handleEditPass } from '../../actions/handleEdit';

export type EditEmailProps = {
    onSuccess?: () => void;
    onClose?: () => void;
}

const EditPass = ({ onClose, onSuccess }: EditEmailProps) => {
    const [state, action, pending] = useActionState(handleEditPass, null)

        useEffect(() => {
            if (state?.success) {
                onSuccess?.();
                onClose?.();
            }
        }, [state, onSuccess, onClose]);

    return (
        <div className='flex flex-col w-full gap-3'>
            <h4 className='text-lg'>Edit Password</h4>
            <form action={action} className='space-y-5'>
                <div>
                    <label htmlFor="old-password" className="dark:text-zinc-300 text-zinc-700 text-sm mb-3">
                        Password Lama
                    </label>
                    <input
                        type="password"
                        id="old-password"
                        name="old-password"
                        placeholder="Masukkan Password Lama Anda"
                        className="w-full px-4 py-3 dark:bg-zinc-800 bg-zinc-50 border dark:border-indigo-500 border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white text-zinc-900 dark:placeholder-zinc-400 placeholder-zinc-500 transition duration-150 focus:border-indigo-500"
                    />
                </div>
                <div>
                    <label htmlFor="new-password" className="dark:text-zinc-300 text-zinc-700 text-sm mb-3">
                        Password Baru
                    </label>
                    <input
                        type="password"
                        id="new-password"
                        name="new-password"
                        placeholder="Masukkan Password Baru"
                        className="w-full px-4 py-3 dark:bg-zinc-800 bg-zinc-50 border dark:border-indigo-500 border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white text-zinc-900 dark:placeholder-zinc-400 placeholder-zinc-500 transition duration-150 focus:border-indigo-500"
                    />
                </div>
                {state?.message && (
                    <p className={`text-sm ${state.success ? 'text-green-500' : 'text-red-500'}`}>
                        {state.message}
                    </p>
                )}
                <div className='flex md:flex-row flex-col items-center justify-end gap-3'>
                    <button
                        type="submit"
                        disabled={pending}
                        className="py-1.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-600 dark:to-indigo-700 light:from-blue-500 light:to-indigo-600 hover:opacity-90 text-white rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {pending ? "Memproses..." : "🚀 Kirim"}
                    </button>
                    <button
                        onClick={onClose}
                        className="py-1.5 px-4 bg-red-600 hover:opacity-90 text-white rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Batal
                    </button>
                </div>
            </form>
        </div>
    )
}

export default EditPass