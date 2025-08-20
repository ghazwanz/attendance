"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function QRImageUploader() {
  const [qrResult, setQrResult] = useState<string | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (!html5QrCodeRef.current) {
      html5QrCodeRef.current = new Html5Qrcode("qr-reader");
    }

    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  // Mulai scan kamera
  const startCameraScan = async () => {
    if (!html5QrCodeRef.current) return;
    try {
      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          setQrResult(decodedText);
          html5QrCodeRef.current?.stop(); // stop setelah scan
        }
      );
    } catch (err) {
      setQrResult("❌ Gagal membuka kamera: " + (err as any).message);
    }
  };

  // Upload gambar untuk scan
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !html5QrCodeRef.current) return;

    try {
      const result = await html5QrCodeRef.current.scanFile(file, true);
      setQrResult(result);
    } catch (err) {
      setQrResult("❌ Gagal membaca QR dari gambar: " + (err as any).message);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* div ini wajib ada untuk html5-qrcode */}
      <div id="qr-reader" className="w-full max-w-sm" />

      <button
        onClick={startCameraScan}
        className="px-4 py-2 bg-green-600 text-white rounded-lg"
      >
        📷 Scan dengan Kamera
      </button>

      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="border p-2 rounded"
      />

      {qrResult && (
        <div className="p-3 bg-gray-100 rounded w-full text-center">
          <strong>Hasil Scan:</strong> {qrResult}
        </div>
      )}
    </div>
  );
}
