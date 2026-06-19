import { NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next');

  if (code) {
    const supabase = await createClient();
    const { error, data: sessionData } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && sessionData?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', sessionData.user.id)
        .single();

      const role = profile?.role ?? 'client';
      let redirectPath = '/lobby';

      if (role === 'admin')              redirectPath = '/admin';
      else if (role === 'moderator')     redirectPath = '/moderator';
      else if (role === 'customer_care') redirectPath = '/customer-care';

      // Only honour `next` for unambiguous same-origin relative paths.
      // Reject protocol-relative (//) and anything that looks like a scheme.
      const safeNext =
        next && next.startsWith('/') && !next.startsWith('//') ? next : null;

      return NextResponse.redirect(`${origin}${safeNext ?? redirectPath}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth?error=auth_callback_failed`);
}
