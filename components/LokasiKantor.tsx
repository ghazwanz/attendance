import { createClient } from '@/lib/supabase/server'
import { create } from 'domain'
import React from 'react'

const LokasiKantor = async () => {
  const supabase = await createClient()
  const data = await supabase.
  from('location_company')
  .select('longtitude, latitude')
  .eq('location_name', 'Mahative Studio')
  .single()
  // console.log(data)

  return (
    <div>
      <div className="w-full h-[440px] rounded-xl overflow-hidden border-4 border-blue-200 dark:border-slate-700 shadow-lg hover:shadow-2xl transition duration-300">
        <iframe
          title="Lokasi Mahative Studio Malang"
          src={`https://maps.google.com/maps?q=${data.data?.latitude},${data.data?.longtitude}&z=18&output=embed`}
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

export default LokasiKantor
