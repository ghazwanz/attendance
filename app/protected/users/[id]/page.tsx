import { getUserAttendanceStats } from './UserStats';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const stats = await getUserAttendanceStats(id);

  return (
    <div className="max-w-2xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl shadow-lg p-6 flex flex-col items-center">
        <span className="text-4xl font-bold mb-2">{stats?.jumlahAbsensi ?? '-'}</span>
        <span className="text-lg font-semibold">Jumlah Absensi</span>
      </div>
      <div className="bg-gradient-to-r from-red-500 to-red-700 text-white rounded-xl shadow-lg p-6 flex flex-col items-center">
        <span className="text-4xl font-bold mb-2">{stats?.jumlahAlpa ?? '-'}</span>
        <span className="text-lg font-semibold">Jumlah Alpa</span>
      </div>
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-xl shadow-lg p-6 flex flex-col items-center">
        <span className="text-4xl font-bold mb-2">{stats?.jumlahIzin ?? '-'}</span>
        <span className="text-lg font-semibold">Jumlah Izin</span>
      </div>
      <div className="bg-gradient-to-r from-orange-500 to-orange-700 text-white rounded-xl shadow-lg p-6 flex flex-col items-center">
        <span className="text-4xl font-bold mb-2">{stats?.jumlahTerlambat ?? '-'}</span>
        <span className="text-lg font-semibold">Jumlah Terlambat</span>
      </div>
      <div className="bg-gradient-to-r from-green-500 to-green-700 text-white rounded-xl shadow-lg p-6 flex flex-col items-center">
        <span className="text-4xl font-bold mb-2">{stats?.jumlahMasuk ?? '-'}</span>
        <span className="text-lg font-semibold">Jumlah Masuk</span>
      </div>
    </div>
  );
}