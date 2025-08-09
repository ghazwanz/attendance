import React from 'react'

const QRTips = () => {
    return (
        <div className="mt-12 bg-blue-100 dark:bg-slate-700/40 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-white mb-4">
                ℹ️ Tips Pemindaian QR
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800 dark:text-blue-200">
                <div>
                    <h4 className="font-semibold mb-2">Masalah Umum:</h4>
                    <ul className="space-y-1 list-disc list-inside">
                        <li>Cahaya ruangan terlalu gelap</li>
                        <li>Kode QR buram atau terlalu kecil</li>
                        <li>QR tidak berisi <code>user_id</code></li>
                        <li>Izin kamera belum diberikan</li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold mb-2">Solusi Cepat:</h4>
                    <ul className="space-y-1 list-disc list-inside">
                        <li>Pastikan pencahayaan cukup</li>
                        <li>Pastikan QR dalam posisi jelas dan stabil</li>
                        <li>Gunakan QR dari halaman profil masing-masing</li>
                        <li>Refresh halaman & izinkan kamera</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default QRTips