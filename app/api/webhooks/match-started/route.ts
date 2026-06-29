import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email';
import { MatchConfirmedEmail } from '@/app/emails/matchConfirmation';
import * as React from 'react';

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    if (payload.type !== 'UPDATE' || payload.table !== 'challenges') {
      return NextResponse.json({ success: true });
    }

    const oldRecord = payload.old_record;
    const newRecord = payload.record;

    // Only fire when status transitions into in_progress
    if (oldRecord.status === 'in_progress' || newRecord.status !== 'in_progress') {
      return NextResponse.json({ success: true });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const matchUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://competehq.online'}/match/${newRecord.id}`;
    const gameName: string = newRecord.game_name ?? 'Match';
    const wagerAmount: number = newRecord.wager_amount ?? Math.round((newRecord.prize_pool ?? 0) / 2);

    // Fetch both players in parallel
    const playerIds: string[] = [newRecord.host_id, newRecord.opponent_id].filter(Boolean);

    const players = await Promise.all(
      playerIds.map(async (uid: string) => {
        const [{ data: userData }, { data: profile }] = await Promise.all([
          supabaseAdmin.auth.admin.getUserById(uid),
          supabaseAdmin.from('profiles').select('username').eq('id', uid).single(),
        ]);
        return {
          email: userData?.user?.email ?? null,
          username: profile?.username ?? 'Player',
        };
      })
    );

    await Promise.all(
      players
        .filter((p) => p.email)
        .map((p) =>
          sendEmail({
            to: p.email!,
            subject: `Match confirmed — ${gameName} #${newRecord.id}`,
            react: React.createElement(MatchConfirmedEmail, {
              username: p.username,
              gameName,
              wagerAmount,
              matchId: newRecord.id,
              matchUrl,
            }),
          })
        )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('match-started webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
