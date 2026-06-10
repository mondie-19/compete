import { createClient } from '@supabase/supabase-js';
import { createClient as createSSRClient } from '@/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        // Verify caller is an admin
        const ssrSupabase = await createSSRClient();
        const { data: { user } } = await ssrSupabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: callerProfile } = await ssrSupabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (callerProfile?.role !== "admin") {
            return NextResponse.json({ error: "Forbidden. Admin privileges required." }, { status: 403 });
        }

        const { username, email, password, role } = await request.json();

        if (!username || !email || !password || !role) {
            return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
        }

        const validRoles = ['client', 'moderator', 'customer_care', 'admin'];
        if (!validRoles.includes(role)) {
            return NextResponse.json({ error: "Invalid role." }, { status: 400 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!serviceRoleKey) {
            return NextResponse.json({
                error: "SUPABASE_SERVICE_ROLE_KEY is missing from environment variables."
            }, { status: 500 });
        }

        const supabaseAdmin = createClient(supabaseUrl!, serviceRoleKey);

        // 1. Create user in Supabase Auth (email pre-confirmed)
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { username, role }
        });

        if (authError) throw authError;

        // 2. Upsert the profile to guarantee role is set correctly.
        //    The on_auth_user_created trigger may have already inserted the row;
        //    upsert handles both the "trigger ran" and the "race condition" cases.
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: authUser.user.id,
                username,
                role,
                region: 'Unknown'
            });

        if (profileError) throw profileError;

        return NextResponse.json({ success: true, user: authUser.user });

    } catch (error: any) {
        console.error('Provisioning Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
