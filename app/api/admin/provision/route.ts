import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { username, email, password, role } = await request.json();

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!serviceRoleKey) {
            return NextResponse.json({ 
                success: false, 
                error: "SUPABASE_SERVICE_ROLE_KEY is missing from environment variables. Please add it to your .env.local file." 
            }, { status: 500 });
        }

        // Initialize Admin Client
        const supabaseAdmin = createClient(supabaseUrl!, serviceRoleKey);

        // 1. Create User in Auth
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { username, role }
        });

        if (authError) throw authError;

        // 2. Update/Insert Profile
        // Note: auth.users trigger usually handles profile creation, but we ensure it's set correctly
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({ 
                username, 
                role,
                region: 'Unknown' 
            })
            .eq('id', authUser.user.id);

        if (profileError) throw profileError;

        return NextResponse.json({ success: true, user: authUser.user });

    } catch (error: any) {
        console.error('Provisioning Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
