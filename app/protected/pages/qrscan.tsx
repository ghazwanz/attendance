'use client';
import { useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function TestScanPage() {
  useEffect(() => {
    const scanner = new Html5Qrcode("reader");

    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length) {
          const cameraId = devices[0].id;

          scanner.start(
            cameraId,
            {
              fps: 10,
              qrbox: 250,
              videoConstraints: { facingMode: "environment" },
            },
            (decodedText, result) => {
              alert("✅ QR scanned:"+ decodedText); // DEBUG
              alert("QR berhasil discan: " + decodedText);
              scanner.stop().then(() => scanner.clear());
            },
            (errorMessage) => {
              alert("Scanning error:"+ errorMessage);
            }
          );
        } else {
          alert("🚫 Tidak ada kamera ditemukan");
        }
      })
      .catch((err) => {
        console.error("Camera error:", err);
      });

    return () => {
      scanner.stop().then(() => scanner.clear());
    };
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Tes QR Scanner</h1>
      <div id="reader" className="w-full max-w-md mx-auto" />
    </div>
  );
}
