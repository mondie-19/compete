import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { PayoutNotification } from '@/app/emails/PayoutNotification';

// This endpoint receives webhooks from Supabase when a match is resolved
// and a payout is processed.
export async function POST(req: Request) {
  try {
    const payload = await req.json();

    // Supabase Webhook payload for UPDATE
    // Example: { type: 'UPDATE', table: 'challenges', record: { ... }, old_record: { ... } }
    if (payload.type === 'UPDATE' && payload.table === 'challenges') {
      const oldRecord = payload.old_record;
      const newRecord = payload.record;

      // Check if status changed to 'resolved' and there is a winner
      if (oldRecord.status !== 'resolved' && newRecord.status === 'resolved' && newRecord.winner_id) {
        
        // Since we only have winner_id, we need to fetch the user profile to get their email and username.
        // For the webhook, we could assume the webhook provides email in a join, or we instantiate a Supabase client.
        // Let's use the Supabase Service Role client to bypass RLS and get the winner's details.
        
        const { createClient } = require('@supabase/supabase-js');
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
        
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(newRecord.winner_id);
        
        if (userError || !userData?.user) {
          console.error('Failed to fetch winner details for payout notification:', userError);
          return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
        }
        
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('username')
          .eq('id', newRecord.winner_id)
          .single();

        const email = userData.user.email;
        const username = profile?.username || 'Operative';
        const gameName = newRecord.game_name || 'Match';
        const payoutAmount = newRecord.prize_pool;

        if (email) {
          await sendEmail({
            to: email,
            subject: `Payout Processed: KES ${payoutAmount} for ${gameName}`,
            react: PayoutNotification({ 
              username, 
              gameName, 
              payoutAmount, 
              matchId: newRecord.id 
            }),
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook payload parsing error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
