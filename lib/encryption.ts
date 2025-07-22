// lib/encryption.ts
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-character-secret-key-here!'; // Must be 32 characters
const ALGORITHM = 'aes-256-cbc';

/**
 * Encrypts data using AES-256-CBC algorithm
 * @param text - The text to encrypt
 * @returns Encrypted data as base64 string
 */
export async function encryptData(text: string): Promise<string> {
    try {
        // Create initialization vector
        const iv = crypto.randomBytes(16);

        // Create cipher
        const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);

        // Encrypt the text
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        // Combine IV and encrypted data
        const result = iv.toString('hex') + ':' + encrypted;

        // Return as base64 for URL safety
        return Buffer.from(result).toString('base64');
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt data');
    }
}

/**
 * Decrypts data using AES-256-CBC algorithm
 * @param encryptedData - The encrypted data as base64 string
 * @returns Decrypted text
 */
export async function decryptData(encryptedData: string): Promise<string> {
    try {
        // Decode from base64
        const combined = Buffer.from(encryptedData, 'base64').toString();

        // Split IV and encrypted data
        const [ivHex, encrypted] = combined.split(':');

        if (!ivHex || !encrypted) {
            throw new Error('Invalid encrypted data format');
        }

        // Create decipher
        const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);

        // Decrypt the data
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt data');
    }
}

/**
 * Validates if encrypted QR data is still valid (not expired)
 * @param encryptedData - The encrypted QR data
 * @returns Object containing validation result and parsed data
 */
export async function validateQRData(encryptedData: string): Promise<{
    isValid: boolean;
    data?: {
        user_id: string;
        status: string;
        timestamp: string;
        expires_at: string;
    };
    error?: string;
}> {
    try {
        // Decrypt the data
        const decryptedJson = await decryptData(encryptedData);
        const data = JSON.parse(decryptedJson);

        // Validate required fields
        if (!data.user_id || !data.status || !data.expires_at) {
            return {
                isValid: false,
                error: 'Missing required fields in QR data'
            };
        }

        // Check if expired
        const expiryTime = new Date(data.expires_at);
        const currentTime = new Date();

        if (currentTime > expiryTime) {
            return {
                isValid: false,
                error: 'QR Code has expired'
            };
        }

        // Validate status values
        const validStatuses = ['HADIR', 'IZIN'];
        if (!validStatuses.includes(data.status)) {
            return {
                isValid: false,
                error: 'Invalid status value'
            };
        }

        return {
            isValid: true,
            data: data
        };

    } catch (error) {
        return {
            isValid: false,
            error: 'Invalid or corrupted QR data'
        };
    }
}

/**
 * Generate a secure random encryption key (for setup purposes)
 * @returns A 32-character random string suitable for AES-256
 */
export function generateEncryptionKey(): string {
    return crypto.randomBytes(32).toString('hex').substring(0, 32);
}