"use server";
import { createClient } from "@/supabase/server";
import { sendEmail } from "@/lib/email";
import { WelcomeEmail } from "@/app/emails/WelcomeEmail";

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

    // Handle "Welcome Letter" dispatch via Resend
    const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://compete.app'}/auth/verify?token=pending`; // Example placeholder for verification link
    await sendEmail({
        to: email,
        subject: `Welcome to Compete, ${username}`,
        react: WelcomeEmail({ username, verificationLink }),
    });

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
