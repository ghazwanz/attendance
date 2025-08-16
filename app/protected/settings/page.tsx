import React from 'react'
import ProfileCard from './components/ProfileCard'
import { getUser } from '@/lib/utils/getUserServer'
import StatusAbsensiUser from './components/StatusAbsensiUser'
import EditModal from './components/Modals/EditModal'
import EditModalEmail from './components/Modals/EditModalEmail'
import { Mail } from 'lucide-react'
import EditModalPassword from './components/Modals/EditModalPassword'
import NotificationSettings from '@/components/NotificationSetting'

const page = async () => {
    const data = await getUser()
    return (
        <div className='flex flex-col gap-5 w-full'>
            <h1 className='text-2xl'>Pengaturan</h1>
            <div className='flex items-stretch gap-4'>
                <ProfileCard>
                    <h2 className='text-lg font-semibold'>Nama Lengkap</h2>
                    <div className='flex justify-between w-full gap-1'>
                        <p>{data.user?.user_metadata.name}</p>
                        <EditModal name={data.user?.user_metadata.name} />
                    </div>
                </ProfileCard>
                <ProfileCard>
                    <h2 className='text-lg font-semibold'>Email</h2>
                    <div className='flex justify-between w-full gap-1'>
                        <p>{data.user?.email}</p>
                        <EditModalEmail email={data.user?.email ?? ""} />
                    </div>
                </ProfileCard>
            </div>
            <div className='flex items-stretch gap-4'>
                <ProfileCard>
                    <div className='flex items-center justify-between w-full gap-1'>
                        <h2 className='text-lg font-semibold'>Masuk Dengan Metode</h2>
                        <div className='flex items-center gap-1'>
                            <Mail width={16} height={16} /> <p>{data.user?.app_metadata.provider}</p>
                        </div>
                    </div>
                </ProfileCard>
                <ProfileCard>
                    <div className='flex items-center justify-between w-full gap-1'>
                        <h2 className='text-lg font-semibold'>Password</h2>
                        <EditModalPassword />
                    </div>
                </ProfileCard>
            </div>
            <NotificationSettings/>
            <StatusAbsensiUser id={data.user?.id ?? ""} />
        </div>
    )
}

export default page