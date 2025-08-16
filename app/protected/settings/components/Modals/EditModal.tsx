"use client"
import React, { useState } from 'react'
import Modal from './Modal';
import EditName from '../Form/EditName';
import { useRouter } from 'next/navigation';
import { showToast } from '@/lib/utils/toast';

const EditModal = ({ name }: { name: string }) => {
    const [isOpen, setIsOpen] = useState(false);

    const router = useRouter();
    const handleClose = ()=> setIsOpen(prev=> !prev);

    const handleSuccess = () => {
        showToast({type:"success",message:"Nama berhasil diubah."})
        router.refresh(); // Refresh the page data
    };
    return (
        <>
            <button onClick={()=>setIsOpen(prev=>!prev)} className='text-blue-600 dark:text-emerald-400 hover:underline'>
                Ubah
            </button>
            <Modal isOpen={isOpen} onClose={handleClose}>
                <EditName name={name} onClose={handleClose} onSuccess={handleSuccess} />
            </Modal>
        </>
    )
}

export default EditModal