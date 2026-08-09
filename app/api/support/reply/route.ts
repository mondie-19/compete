import { NextResponse } from 'next/server';
import { createClient as createSSRClient } from '@/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email';
import * as React from 'react';
import { SupportReplyEmail } from '@/app/emails/SupportReplyEmail';

const CATEGORY_LABELS: Record<string, string> = {
  game:     'Game Suggestion',
  platform: 'Platform Request',
  bug:      'Bug Report',
  feedback: 'General Feedback',
};

export async function POST(req: Request) {
  try {
    // Verify caller is authorized support staff
    const ssrSupabase = await createSSRClient();
    const { data: { user } } = await ssrSupabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await ssrSupabase
      .from('profiles')
      .select('role, username')
      .eq('id', user.id)
      .single();

    const allowedRoles = ['customer_care', 'moderator', 'admin'];
    if (!allowedRoles.includes(profile?.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { feedbackId, to, replyMessage, originalMessage, category } = await req.json();

    if (!feedbackId || !to || !replyMessage?.trim()) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const agentName = profile?.username ?? 'Support';
    const categoryLabel = CATEGORY_LABELS[category] ?? category;
    const subject = `Re: Your ${categoryLabel} — Compete Support`;

    // Send the reply email
    const result = await sendEmail({
      to,
      subject,
      react: React.createElement(SupportReplyEmail, {
        agentName,
        replyMessage: replyMessage.trim(),
        originalMessage,
        category,
      }),
    });

    if (!result.success) {
      return NextResponse.json({ error: 'Failed to send email.' }, { status: 500 });
    }

    // Mark feedback as reviewed
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    await supabaseAdmin.from('feedback').update({ status: 'reviewed' }).eq('id', feedbackId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Support reply error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
