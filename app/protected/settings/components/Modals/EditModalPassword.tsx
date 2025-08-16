"use client"
import React, { useState } from 'react'
import Modal from './Modal';
import EditName from '../Form/EditName';
import { useRouter } from 'next/navigation';
import { showToast } from '@/lib/utils/toast';
import EditPass from '../Form/EditPassword';

const EditModalPassword = () => {
    const [isOpen, setIsOpen] = useState(false);

    const router = useRouter();
    const handleClose = ()=> setIsOpen(prev=> !prev);

    const handleSuccess = () => {
        showToast({type:"success",message:"Password berhasil diubah."})
        router.refresh(); // Refresh the page data
    };
    return (
        <>
            <button onClick={()=>setIsOpen(prev=>!prev)} className='text-blue-600 dark:text-emerald-400 hover:underline'>
                Ubah Password
            </button>
            <Modal isOpen={isOpen} onClose={handleClose}>
                <EditPass onClose={handleClose} onSuccess={handleSuccess} />
            </Modal>
        </>
    )
}

export default EditModalPassword