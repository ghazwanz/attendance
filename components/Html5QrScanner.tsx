'use client';
import { useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

type Props = {
  onScanSuccess: (data: string) => void;
  onScanError?: (err: string) => void;
};

export default function Html5QrScanner({ onScanSuccess, onScanError }: Props) {
  useEffect(() => {
    const qrCodeRegionId = 'qr-reader';
    const html5QrCode = new Html5Qrcode(qrCodeRegionId);

    Html5Qrcode.getCameras().then((devices) => {
      if (devices && devices.length) {
        // Cari kamera belakang
        const backCamera = devices.find((device) =>
          device.label.toLowerCase().includes('back') || device.label.toLowerCase().includes('rear')
        );
        const cameraId = backCamera ? backCamera.id : devices[0].id;

        html5QrCode
          .start(
            cameraId,
            { fps: 10, qrbox: 250 },
            (decodedText) => {
              onScanSuccess(decodedText);
              html5QrCode.stop();
            },
            (errorMessage) => {
              if (onScanError) onScanError(errorMessage);
            }
          )
          .catch((err) => console.error('Start failed', err));
      }
    });

    return () => {
      html5QrCode
        .stop()
        .then(() => html5QrCode.clear())
        .catch((err) => console.error('Stop failed', err));
    };
  }, [onScanSuccess, onScanError]);

  return <div id="qr-reader" className="w-full" />;
}
