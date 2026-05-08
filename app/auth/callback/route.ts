import { NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/lobby';

  if (code) {
    const supabase = await createClient();
    const { error, data: sessionData } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && sessionData?.user) {
      // Determine user role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', sessionData.user.id)
        .single();

      const role = profile?.role || 'client';
      let redirectPath = '/lobby';

      if (role === 'admin') redirectPath = '/admin';
      else if (role === 'moderator') redirectPath = '/moderator';

      return NextResponse.redirect(`${origin}${searchParams.get('next') ?? redirectPath}`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth?error=auth_callback_failed`);
}