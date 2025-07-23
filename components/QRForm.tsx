'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface User {
  id: string;
  name: string;
}

export function QRForm({ users, encryptedQRData }: { users: User[], encryptedQRData: string | null }) {
  const [userId, setUserId] = useState('');
  const [status, setStatus] = useState('');
  const [qrData, setQrData] = useState<string | null>(encryptedQRData);

  const handleGenerate = (value: string) => {
    if (!userId) return;
    const payload = JSON.stringify({ user_id: userId, status: value, timestamp: Date.now() });
    setQrData(btoa(payload));
    setStatus(value);
  };

  return (
    <div className="w-full max-w-xl mx-auto mt-8 text-center space-y-4">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
        ✨ Presensi Cepat Tanpa Login
      </h2>

      <div className="space-y-4">
        <select
          name="user_id"
          className="w-full p-2 border rounded bg-white dark:bg-gray-900 dark:text-white"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        >
          <option value="" disabled>-- Pilih Nama --</option>
          {users?.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>

        <div className="flex flex-col md:flex-row gap-4 md:justify-center mt-2">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => handleGenerate("HADIR")}
          >
            Tampilkan QR HADIR
          </button>
          <button
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            onClick={() => handleGenerate("IZIN")}
          >
            Tampilkan QR IZIN
          </button>
        </div>

        {/* QR Code tampil di bawah tombol */}
        <div className="mt-6 text-center">
          {qrData && <QRWithExpiry base64Data={qrData} />}
        </div>
      </div>
    </div>
  );
}

function QRWithExpiry({ base64Data }: { base64Data: string }) {
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    const decoded = atob(base64Data);
    const parsed = JSON.parse(decoded);
    const createdAt = parsed.timestamp;
    const now = Date.now();

    if (now - createdAt > 300000) {
      setIsValid(false);
    }

    const interval = setInterval(() => {
      const now = Date.now();
      setIsValid(now - createdAt <= 300000);
    }, 1000);

    return () => clearInterval(interval);
  }, [base64Data]);

  if (!isValid) {
    return <p className="text-sm text-red-500">QR telah kadaluarsa. Silakan generate ulang.</p>;
  }

  return (
    <div className="inline-block p-4 bg-white dark:bg-neutral-200 rounded shadow-md">
      <QRCodeSVG value={atob(base64Data)} width={200} height={200} />
    </div>
  );
}
