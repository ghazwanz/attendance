declare module 'react-qr-scanner' {
  import * as React from 'react';

  interface QrScannerProps {
    delay?: number;
    onError?: (error: any) => void;
    onScan?: (data: string | null) => void;
    style?: React.CSSProperties;
    className?: string;
    facingMode?: 'user' | 'environment'; // ✅ harus ada dua opsi
  }

  const QrScanner: React.ComponentType<QrScannerProps>;

  export default QrScanner;
}
