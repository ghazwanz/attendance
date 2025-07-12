import React from 'react'
import FormInputUser from './components/FormInputUser'


export default function page() {
    return (
        <div className="rounded-2xl shadow-lg dark:shadow-white/20 p-8">
            <div className='w-full'>
                <FormInputUser />
            </div>
        </div>
    )
}