import React, { useActionState, useEffect } from 'react'
import { handleUpdatePassword } from '../actions/handleUpdatePassword';
import { showToast } from '@/lib/utils/toast';
import { Button } from '@/components/ui/button';

const UpdatePasswordModal = ({ onClose }: { onClose: () => void }) => {
    const [state, action, pending] = useActionState(handleUpdatePassword, null);
    
    useEffect(() => {
        if (state && state?.success) {
            showToast({ type: "success", message: "Password berhasil diupdate" })
            onClose()
        }
        if (state && !state?.success) {
            showToast({ type: "error", message: "Password anda salah" })
            onClose()
        }
    }, [state]);

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-lg">
                <h2 className="text-lg font-semibold mb-4">Ubah Password</h2>
                <form action={action}>

                    <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">Password Lama</label>
                        <input
                            type="password"
                            id='password'
                            name='password'
                            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">Password Baru</label>
                        <input
                            type="password"
                            id='new-password'
                            name='new-password'
                            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    <div className="flex justify-end">
                        <Button
                            type='submit'
                            disabled={pending}
                            variant={"success"}
                        >
                            {pending ? 'Mengubah...' : 'Ubah'}
                        </Button>
                        <Button
                            onClick={onClose}
                            className="ml-3"
                            variant={"destructive"} 
                        >
                            Batal
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default UpdatePasswordModal