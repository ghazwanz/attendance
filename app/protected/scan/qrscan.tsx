// QRScanner.tsx
'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const QrReader = dynamic(() => import('react-qr-scanner'), { ssr: false });

interface QRScannerProps {
  onScanSuccess: (userId: string) => void;
  onScanError: (error: string) => void;
}

export default function QRScanner({ onScanSuccess, onScanError }: QRScannerProps) {
  const [delay] = useState(500);

  const handleScan = (result: any) => {
    if (result?.text) {
      try {
        const parsed = JSON.parse(result.text);
        onScanSuccess(parsed.user_id); // pastikan user_id ada dalam QR
      } catch (e) {
        onScanError('QR tidak valid');
      }
    }
  };

  const handleError = (err: any) => {
    onScanError('Gagal memindai QR');
  };

  return (
    <div className="w-full">
      <QrReader
        delay={delay}
        onScan={handleScan}
        onError={handleError}
        style={{ width: '100%' }}
      />
    </div>
  );
}
