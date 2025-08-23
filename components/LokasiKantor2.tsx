import { createClient } from '@/lib/supabase/server'
import React from 'react'

const LokasiKantor2 = async () => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('location_company')
    .select('longtitude, latitude')
    .eq('location_name', 'Kipaworks')
    .single()

  if (error) {
    console.error(error)
    return <p className="text-red-500">Gagal memuat lokasi</p>
  }

  const longitude = data?.longtitude
  const latitude = data?.latitude

  return (
    <div>
      <div className="w-full h-[440px] rounded-xl overflow-hidden border-4 border-blue-200 dark:border-slate-700 shadow-lg hover:shadow-2xl transition duration-300">
        <iframe
          title="Lokasi Mahative Studio Malang"
          src={`https://maps.google.com/maps?q=${latitude},${longitude}&z=18&output=embed`}
          width="100%"
          height="100%"
          allowFullScreen
          loading="lazy"
          className="border-0"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  )
}

export default LokasiKantor2
