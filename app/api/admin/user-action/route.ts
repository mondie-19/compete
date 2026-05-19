import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createSSRClient } from "@/supabase/server";

export async function POST(request: Request) {
    try {
        // Authenticate the current session to ensure the caller is an admin
        const ssrSupabase = await createSSRClient();
        const { data: { user } } = await ssrSupabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: profile } = await ssrSupabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (profile?.role !== "admin") {
            return NextResponse.json({ error: "Forbidden. Admin privileges required." }, { status: 403 });
        }

        // Body parsing
        const { userId, action } = await request.json();

        if (!userId || !action) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        // Initialize admin client
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        if (!supabaseServiceKey) {
            return NextResponse.json({ error: "Service role key not configured." }, { status: 500 });
        }

        const adminAuthClient = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        // Execute action
        if (action === "ban") {
            // Ban for 100 years
            const { error } = await adminAuthClient.auth.admin.updateUserById(userId, {
                ban_duration: "876000h"
            });
            if (error) throw error;
        } else if (action === "delete") {
            const { error } = await adminAuthClient.auth.admin.deleteUser(userId);
            if (error) throw error;
        } else if (action === "reset_password") {
            const { data: { user: targetUser }, error: getErr } = await adminAuthClient.auth.admin.getUserById(userId);
            if (getErr) throw getErr;
            if (targetUser?.email) {
                const { error } = await adminAuthClient.auth.admin.generateLink({
                    type: "recovery",
                    email: targetUser.email
                });
                if (error) throw error;
            } else {
                throw new Error("Target user email not found");
            }
        } else {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
