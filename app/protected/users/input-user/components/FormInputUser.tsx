'use client'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'

const FormInputUser = () => {
    const [state, setState] = useState<{
        success?: boolean
        message?: string
        pending?: boolean
    }>({})

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        
        setState({ pending: true })

        const formData = new FormData(e.currentTarget)
        const data = {
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            password: formData.get('password') as string,
        }

        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })

            const result = await response.json()

            if (response.ok) {
                setState({ 
                    success: true, 
                    message: result.message || 'User created successfully!',
                    pending: false 
                })
                // Reset form on success
                e.currentTarget.reset()
            } else {
                setState({ 
                    success: false, 
                    message: result.message || 'An error occurred',
                    pending: false 
                })
            }
        } catch (error) {
            setState({ 
                success: false, 
                message: 'Network error. Please try again.',
                pending: false 
            })
        }
    }

    return (
        <form 
            onSubmit={handleSubmit}
            className="space-y-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 p-6 rounded-xl shadow-md transition-all w-full"
        >
            <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                ✏️ Tambah User
            </h2>

            <div>
                <label 
                    htmlFor='email' 
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                    Email
                </label>
                <input
                    type="email"
                    name='email'
                    id='email'
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    disabled={state.pending}
                    placeholder="Enter email address"
                />
            </div>

            <div>
                <label 
                    htmlFor='name' 
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                    Name
                </label>
                <input
                    type="text"
                    name='name'
                    id='name'
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    disabled={state.pending}
                    placeholder="Enter full name"
                />
            </div>

            <div>
                <label 
                    htmlFor='password' 
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                    Password
                </label>
                <input
                    type="password"
                    name='password'
                    id='password'
                    required
                    minLength={6}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    disabled={state.pending}
                    placeholder="Enter password (min 6 characters)"
                />
            </div>

            {/* Success Message */}
            <p className={state?.success?`text-green-700`:`text-red-700`}>{state?.message?.toString()}</p>

            <Button 
                type='submit' 
                disabled={state.pending}
                className="w-full"
            >
                {state.pending ? 'Creating User...' : 'Create User'}
            </Button>
        </form>
    )
}

export default FormInputUser