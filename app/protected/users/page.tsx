// app/users/page.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import UsersTable from './UsersTable';
import { User } from '@/lib/type';
import { createClient, createAdmin } from '@/lib/supabase/server';

// Server Actions
async function createUser(formData: FormData) {
  'use server';

  const supabase = await createAdmin();

  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) {
    redirect('/auth/login');
  }

  const { data: currentUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', authUser.id)
    .single();

  if (currentUser?.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;

  try {
    const { error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password,
      email_confirm: true,
      user_metadata: { name, role }
    });

    if (authError) throw authError;

    revalidatePath('/users');
    return { success: true };
  } catch (error: Error | any) {
    console.error('Error creating user:', error);
    return { success: false, error: error.message };
  }
}

async function updateUser(formData: FormData) {
  'use server';

  const supabase = await createClient();
  const supabaseAdmin = await createAdmin();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) {
    redirect('/auth/login');
  }

  const { data: currentUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', authUser.id)
    .single();

  if (currentUser?.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  const userId = formData.get('userId') as string;
  const name = formData.get('name') as string;
  const role = formData.get('role') as string;
  const email = formData.get('email') as string;

  try {
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      email: email,
      email_confirm: true,
      user_metadata: {
        name,
        role,
      },
    });
    if (updateError) throw updateError;
    const { error } = await supabase
      .from('users')
      .update({ name, role })
      .eq('id', userId);

    if (error) throw error;

    revalidatePath('/users');
    return { success: true };
  } catch (error: Error | any) {
    console.error('Error updating user:', error);
    return { success: false, error: error.message };
  }
}

async function deleteUser(formData: FormData) {
  'use server';

  const supabase = await createAdmin();

  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) {
    redirect('/auth/login');
  }

  const { data: currentUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', authUser.id)
    .single();

  if (currentUser?.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  const userId = formData.get('userId') as string;

  try {
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    if (authError) console.warn('Auth user deletion failed:', authError);

    revalidatePath('/users');
    return { success: true };
  } catch (error: Error | any) {
    console.error('Error deleting user:', error);
    return { success: false, error: error.message };
  }
}

// Main Server Component
export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const supabaseClient = await createClient();
  const supabaseAdmin = await createAdmin();

  const { data } = await supabaseClient.auth.getUser();
  if (!data.user) {
    redirect('/auth/login');
  }

  const { data: currentUser } = await supabaseClient
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (!currentUser) {
    redirect('/auth/login');
  }

  let users: User[] = [];
  if (currentUser.role === 'admin') {
    const { data: allAuthUsers, error } = await supabaseAdmin.auth.admin.listUsers();
    const { data: userTableData } = await supabaseAdmin
      .from('users')
      .select('id, name, role');

    if (!error && allAuthUsers?.users) {
      users = allAuthUsers.users.map((user) => {
        const fallbackUser = userTableData?.find((u) => u.id === user.id);
        return {
          id: user.id,
          name: user.user_metadata?.name || fallbackUser?.name || '',
          email: user.email || '',
          role: user.user_metadata?.role || fallbackUser?.role || '',
          created_at: user.created_at,
        };
      });
    }
  } else {
    users = [currentUser];
  }

  // Await the searchParams promise
  const { search } = await searchParams;
  const filteredUsers = search?.toLowerCase()
    ? users.filter(user =>
      user.name?.toLowerCase().includes(search) ||
      user.role?.toLowerCase().includes(search)
    )
    : users;

  return (
    <div className="rounded-2xl shadow-lg dark:shadow-white/20 p-8">
      <UsersTable
        users={filteredUsers}
        currentUser={currentUser}
        createUserAction={createUser}
        updateUserAction={updateUser}
        deleteUserAction={deleteUser}
      />
    </div>
  );
}