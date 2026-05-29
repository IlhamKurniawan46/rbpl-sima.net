import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const email = 'admin@simanet.id';
    const password = 'admin123';
    const fullName = 'Super Admin';

    // Initialize Supabase Admin client using service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Check if the user already exists in auth.users by attempting to list users.
    // If listUsers is blocked by API policies or encounters database issues, we catch it
    // and try directly to create it without checking/deleting, or handle it robustly.
    let existingUser = null;
    try {
      const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      if (!listError && usersData) {
        existingUser = usersData.users.find(u => u.email === email);
      }
    } catch (e) {
      console.log('Skipping user list check, proceeding directly to creation');
    }

    if (existingUser) {
      // Delete existing profile and auth user to start fresh
      await supabaseAdmin.from('profiles').delete().eq('id', existingUser.id);
      await supabaseAdmin.auth.admin.deleteUser(existingUser.id);
    }

    // 2. Create the Admin user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      }
    });

    if (authError || !authData.user) {
      // If user creation fails because the user already exists, let's catch that
      if (authError?.message?.toLowerCase().includes('already exists') || authError?.message?.toLowerCase().includes('duplicate')) {
        return NextResponse.json({
          success: false,
          error: 'User already exists in auth.users. Please log in using the email and password.'
        });
      }
      throw new Error(authError?.message || 'Failed to create auth user');
    }

    // 3. Force update/upsert their role to 'admin' in profiles table
    // (This ensures that even if handle_new_user trigger set them as customer, they become an admin)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: authData.user.id,
        role: 'admin',
        full_name: fullName,
        phone: '08123456789'
      });

    if (profileError) {
      throw new Error(`Failed to update profile: ${profileError.message}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Super Admin successfully initialized!',
      details: {
        email: email,
        password: password,
        fullName: fullName,
        role: 'admin',
        userId: authData.user.id
      }
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message || 'Internal Server Error'
    }, { status: 500 });
  }
}
