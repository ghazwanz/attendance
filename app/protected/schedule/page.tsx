import React from 'react'
import data from "@/lib/dummyData.json";
import { LucidePencil, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Schedule } from '@/lib/type';
import { PostgrestSingleResponse } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import Tabeljadwal from './tabeljadwal';
import Tambahjadwal from './Tambahjadwal';

const page = async () => {
    
    return (
        <div className="rounded-2xl shadow-lg dark:shadow-white/20 p-8">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold">📋 Tabel Jadwal</h2>
                    <p className="text-gray-500 mt-1">Data jadwal kantor secara keseluruhan</p>
                </div>
                <Tambahjadwal/>
            </div>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
                <Tabeljadwal />
            </div>
        </div>
    )
}

export default page;
