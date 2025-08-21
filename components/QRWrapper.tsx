"use client"
import QRScanner from '@/app/scan/qrscan'
import { useLocationStores } from '@/lib/stores/useLocationStores'
import { UseUserLocationEffect } from '@/lib/utils/getUserLocation'


const QRWrapper = () => {
    // useUserLocationEffect()

    const isOutside = useLocationStores(state=>state.isOutside)
    console.log(isOutside)
    return (
        <div className="bg-white dark:bg-slate-800 shadow-md rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                QR Scanner
            </h2>
            <QRScanner
                isOutside={isOutside}
            // setIsOutside={setIsOutside}
            />
        </div>
    )
}

export default QRWrapper