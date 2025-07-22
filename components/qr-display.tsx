'use client';
import { QRCodeSVG } from "qrcode.react";

interface QRDisplayProps {
    encryptedData: string;
    userName?: string;
    status?: string;
}

export function QRDisplay({ encryptedData, userName, status }: QRDisplayProps) {
    return (
        <div className="mt-6 text-center space-y-2">
            <div className="bg-white p-4 rounded-lg shadow-lg inline-block">
                <QRCodeSVG
                    value={encryptedData}
                    size={200}
                    level="M"
                    includeMargin={true}
                />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
                QR Code untuk {userName} - Status: {status}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
                Data is encrypted and secure
            </p>
        </div>
    );
}