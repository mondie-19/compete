"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// Initialize Supabase Admin Client with Service Role Key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function adminAction(action: 'ban' | 'delete' | 'reset' | 'create', payload: any) {
  try {
    switch (action) {
      case 'ban':
        // Banning in Supabase is typically done by setting ban_duration or updating a flag in profiles
        // For simplicity, we update the profile to 'banned' and could sign them out.
        const { error: banError } = await supabaseAdmin
          .from('profiles')
          .update({ role: 'banned' }) // Or a dedicated 'is_banned' column if it exists
          .eq('id', payload.userId);
        if (banError) throw banError;
        break;

      case 'delete':
        const { error: delError } = await supabaseAdmin.auth.admin.deleteUser(payload.userId);
        if (delError) throw delError;
        // Profile is usually deleted via CASCADE in DB, but we ensure it here if not.
        break;

      case 'reset':
        // Send a password reset email from the admin level
        const { error: resetError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'recovery',
          email: payload.email,
        });
        if (resetError) throw resetError;
        // In a real app, you might send this link via email or return it.
        break;

      case 'create':
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: payload.email,
          password: payload.password,
          email_confirm: true,
          user_metadata: { username: payload.username }
        });
        if (createError) throw createError;
        break;

      default:
        throw new Error("Invalid Administrative Protocol");
    }

    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    console.error(`Admin Action Error [${action}]:`, error);
    return { error: error.message || "Protocol Failure" };
  }
}
