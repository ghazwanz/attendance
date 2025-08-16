"use client"
import React, { useState } from 'react'
import Modal from './Modal';
import { useRouter } from 'next/navigation';
import { showToast } from '@/lib/utils/toast';
import EditEmail from '../Form/EditEmail';

const EditModalEmail = ({ email }: { email: string }) => {
    const [isOpen, setIsOpen] = useState(false);

    const router = useRouter();
    const handleClose = ()=> setIsOpen(prev=> !prev);

    return (
        <>
            <button onClick={()=>setIsOpen(prev=>!prev)} className='text-blue-600 dark:text-emerald-400 hover:underline'>
                Ubah
            </button>
            <Modal isOpen={isOpen} onClose={handleClose}>
                <EditEmail email={email} onClose={handleClose} />
            </Modal>
        </>
    )
}

export default EditModalEmail