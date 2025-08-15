import React from 'react'

const ProfileCard = ({ children }: React.PropsWithChildren) => {
    return (
        <div className='flex flex-col w-full items-start border gap-3 border-gray-200 dark:border-slate-600 rounded-lg px-4 py-3 bg-white dark:bg-slate-700 shadow-sm'>
            {children}
        </div>
    )
}

export default ProfileCard