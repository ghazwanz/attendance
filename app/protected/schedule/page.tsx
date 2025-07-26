import React from 'react'
import Tabeljadwal from './tabeljadwal';
// import Tambahjadwal from './Tambahjadwal';

const page = () => {
    
    return (
        <div className="rounded-2xl shadow-lg dark:shadow-white/20 p-8">
            <div className="mb-6 flex items-center justify-center text-center">
                <div>
                    <h2 className="text-3xl font-bold">📋 Tabel Jadwal</h2>
                    <p className="text-gray-500 mt-1">Data jadwal kantor secara keseluruhan</p>
                </div>
                {/* <Tambahjadwal/> */}
            </div>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
                <Tabeljadwal />
            </div>
        </div>
    )
}

export default page;
