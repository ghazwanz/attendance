import { createClient } from '@/lib/supabase/client';

export async function getUserAttendanceStats(userId: string) {
  const supabase = createClient();

  // Fetch all attendances for the user
  const { data: attendances, error } = await supabase
    .from('attendances')
    .select('*')
    .eq('user_id', userId);

  if (error || !attendances) return null;

  let jumlahAbsensi = attendances.length;
  let jumlahAlpa = attendances.filter(a => a.status === 'ALPA').length;
  let jumlahIzin = attendances.filter(a => a.status === 'IZIN').length;
  let jumlahTerlambat = attendances.filter(a => {
    if (!a.check_in) return false;
    const jamMasuk = new Date(a.check_in).getHours();
    return jamMasuk > 8; // misal terlambat jika masuk setelah jam 8
  }).length;
  let jumlahMasuk = attendances.filter(a => a.status === 'HADIR').length;

  return {
    jumlahAbsensi,
    jumlahAlpa,
    jumlahIzin,
    jumlahTerlambat,
    jumlahMasuk,
  };
}
