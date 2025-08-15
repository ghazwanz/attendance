import { getUserInfo } from "./UserStats";
import UserStatsPage from "./UserStatsPage";

export default async function PageWrapper({ params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserInfo((await params).id);
  return (
    <div className="w-full min-h-[80dvh] flex flex-col justify-center">
      {/* User Info */}
      <div className="mb-6 p-4 rounded-xl bg-white dark:bg-slate-800 shadow flex flex-col md:flex-row md:items-center md:justify-between">
        <div className='flex justify-between items-center w-full'>
          <div className='mb-2'>
            <h3>Nama</h3>
            <div className="text-lg font-bold text-blue-700 dark:text-white">{userId?.name ?? '-'}</div>
          </div>
          <div className='mb-2'>
            <h3>Email</h3>
            <div className="text-lg font-bold text-blue-700 dark:text-white">{userId?.email ?? '-'}</div>
          </div>
        </div>
      </div>

      <UserStatsPage params={params} />
    </div>
  );
}