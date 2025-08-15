import { createClient } from '@/lib/supabase/client';

export async function getUserAttendanceStats(userId: string, month?: number, year?: number) {
  const supabase = createClient();

  let query = supabase
    .from('attendances')
    .select('*')
    .eq('user_id', userId);

  if (month && year) {
    // Filter by month and year
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);
    query = query.gte('date', start.toISOString()).lte('date', end.toISOString());
  }

  const { data: attendances, error } = await query;
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
