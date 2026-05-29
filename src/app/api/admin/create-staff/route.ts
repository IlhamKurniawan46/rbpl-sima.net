import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password, full_name, phone, role } = await request.json();

    if (!email || !password || !full_name || !role) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    if (role !== 'admin' && role !== 'technician') {
      return NextResponse.json({ error: 'Role tidak valid untuk staff' }, { status: 400 });
    }

    // Initialize Supabase Admin client with service role key and options
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // 1. Create the user using the Admin Auth API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim(),
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: full_name,
        phone: phone || null,
      }
    });

    if (authError || !authData.user) {
      return NextResponse.json({ error: authError?.message || 'Gagal membuat user auth' }, { status: 400 });
    }

    // 2. Automatically update/upsert the profile row with the selected role (admin or technician).
    // Note: The handle_new_user database trigger on public.profiles might have already run
    // automatically and inserted a profile with the default role 'customer'.
    // Therefore, using upsert is highly resilient here.
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: authData.user.id,
        role: role,
        full_name: full_name,
        phone: phone || null
      });

    if (profileError) {
      console.error('[CreateStaff API] Profile update failed:', profileError.message, profileError.details, profileError.hint);
      // Clean up the created auth user if profile setup fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: `Gagal membuat profil: ${profileError.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, userId: authData.user.id });
  } catch (err: any) {
    console.error('[CreateStaff API] Internal server error:', err);
    return NextResponse.json({ error: err.message || 'Terjadi kesalahan internal server' }, { status: 500 });
  }
}
