'use server';
import { encrypt } from '@/lib/encryption';
import { redirect } from 'next/navigation';

export async function generateEncryptedData(user_id: string, status: string) {
    if (!user_id || !status) {
        throw new Error('User ID and status are required');
    }

    const dataToEncrypt = JSON.stringify({
        user_id: user_id,
        status: status,
        timestamp: new Date().toISOString()
    });

    const encryptedData = encrypt(dataToEncrypt);
    const encodedData = encodeURIComponent(encryptedData);

    redirect(`/?data=${encodedData}`);
}