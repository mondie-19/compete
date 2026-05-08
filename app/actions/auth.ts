"use server";
import { createClient } from "@/supabase/server";

/**
 * SIGN UP: Create a new account and profile
 */
export async function signUp(email: string, password: string, username: string) {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                username: username,
            },
        },
    });

    if (error) {
        return { error: error.message };
    }

    // Handle "Welcome Letter" dispatch
    // For now, we simulate this. In a real scenario, you'd use a service like Resend.
    console.log(`[MAIL TERMINAL]: Welcome Letter sent to ${email} for operative ${username}.`);

    return { success: true, user: data.user, role: 'client' };
}

/**
 * SIGN IN: Authorize existing operative
 */
export async function signIn(email: string, password: string) {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { error: error.message };
    }

    // Fetch the user's role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

    const role = profile?.role || 'client';

    return { success: true, user: data.user, role };
}

/**
 * SIGN OUT: Terminate session
 */
export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
}
