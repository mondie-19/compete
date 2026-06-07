import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/webhooks/paystack
 *
 * Handles Paystack webhook events server-side.
 * This is the reliable fallback for deposits — if a user closes the browser
 * tab after paying (M-PESA push, bank transfer), the client-side onSuccess
 * callback never fires. Paystack will still call this endpoint so the vault
 * balance is credited regardless.
 *
 * Required env vars:
 *   PAYSTACK_WEBHOOK_SECRET   — copy from Paystack dashboard → Settings → API Keys & Webhooks
 *   NEXT_PUBLIC_SUPABASE_URL  — already present
 *   SUPABASE_SERVICE_ROLE_KEY — already present (used in payout webhook)
 */

// Paystack sends the raw body for HMAC validation — we must NOT parse with
// Next.js body parsing, so we read the raw bytes manually.
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    // ── 1. Read raw body for signature verification ──────────────────────
    const rawBody = await req.text();
    const signature = req.headers.get('x-paystack-signature') ?? '';
    const secret = process.env.PAYSTACK_WEBHOOK_SECRET ?? '';

    if (!secret) {
      console.error('[Paystack Webhook] PAYSTACK_WEBHOOK_SECRET is not set.');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    // ── 2. Validate HMAC-SHA512 signature ────────────────────────────────
    const expectedSig = crypto
      .createHmac('sha512', secret)
      .update(rawBody)
      .digest('hex');

    if (expectedSig !== signature) {
      console.warn('[Paystack Webhook] Invalid signature — request rejected.');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // ── 3. Parse and handle the event ────────────────────────────────────
    const event = JSON.parse(rawBody) as PaystackEvent;

    if (event.event === 'charge.success') {
      const { reference, amount, currency, customer } = event.data;

      // Only process KES transactions
      if (currency !== 'KES') {
        return NextResponse.json({ received: true, skipped: 'non-KES currency' });
      }

      // Convert from Paystack subunits (kobo/cents) to whole KES
      const amountKES = amount / 100;

      // Enforce the same limits as the client-side flow
      if (amountKES < 50 || amountKES > 50000) {
        console.warn(`[Paystack Webhook] Amount ${amountKES} KES out of bounds — skipping.`);
        return NextResponse.json({ received: true, skipped: 'amount out of bounds' });
      }

      // ── 4. Look up the user by email using the service-role client ─────
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { data: authData, error: authError } = await supabaseAdmin.auth.admin
        .listUsers({ page: 1, perPage: 1000 });

      if (authError) {
        console.error('[Paystack Webhook] Failed to list users:', authError);
        return NextResponse.json({ error: 'Failed to look up user' }, { status: 500 });
      }

      const matchedUser = authData.users.find(
        (u) => u.email?.toLowerCase() === customer.email?.toLowerCase()
      );

      if (!matchedUser) {
        console.warn(`[Paystack Webhook] No user found for email: ${customer.email}`);
        // Return 200 so Paystack doesn't retry — we can't credit an unknown user
        return NextResponse.json({ received: true, skipped: 'user not found' });
      }

      // ── 5. Call the deposit_funds RPC (idempotent via reference) ───────
      const { error: rpcError } = await supabaseAdmin.rpc('deposit_funds', {
        p_user_id: matchedUser.id,
        p_amount: amountKES,
        p_reference_id: reference,
      });

      if (rpcError) {
        // If the error is a duplicate reference, it's already been credited
        // (e.g. the client-side callback already ran). Treat as success.
        if (rpcError.message?.toLowerCase().includes('duplicate') ||
            rpcError.code === '23505') {
          console.info(`[Paystack Webhook] Reference ${reference} already processed — skipping duplicate.`);
          return NextResponse.json({ received: true, skipped: 'duplicate reference' });
        }
        console.error('[Paystack Webhook] deposit_funds RPC error:', rpcError);
        return NextResponse.json({ error: rpcError.message }, { status: 500 });
      }

      console.info(`[Paystack Webhook] ✅ Credited ${amountKES} KES to user ${matchedUser.id} (ref: ${reference})`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Paystack Webhook] Unhandled error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// ── Type definitions ──────────────────────────────────────────────────────────
interface PaystackEvent {
  event: string;
  data: {
    reference: string;
    amount: number;       // in subunits (kobo/cents)
    currency: string;
    status: string;
    customer: {
      email: string;
    };
  };
}
