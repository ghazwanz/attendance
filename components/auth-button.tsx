'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

export default function AuthButton() {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/'; // langsung arahkan ke homepage
  };

  return (
    <div className="flex items-center gap-2">
      {user ? (
        <>
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {user.email}
          </span>
          <button
            onClick={handleLogout}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button>
        </>
      ) : (
        <a
          href="/auth/login"
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Login
        </a>
      )}
    </div>
  );
}
