"use server";
import { createClient } from "@/supabase/server";

/**
 * Helper to format currency consistently as KES 50,000.00
 * Used for server-side error messages and return payloads
 */
const formatKES = (amount: number) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2,
  }).format(amount);
};

/**
 * DEPOSIT: Verify and add funds with KES 50 - 50,000 limits
 */
export async function verifyAndAddFunds(reference: string, amount: number) {
  const supabase = await createClient();

  // 1. Pre-verification Limit Check (Safety check)
  if (amount < 50) return { error: `Minimum deposit is ${formatKES(50)}` };
  if (amount > 50000) return { error: `Maximum deposit is ${formatKES(50000)}` };

  // 2. Verify transaction with Paystack API
  const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    },
  });

  const data = await response.json();

  if (data.status && data.data.status === "success") {
    // Paystack returns amount in subunits (Cents). Convert to KES.
    const verifiedAmount = data.data.amount / 100;

    // Security: Validate the actual amount Paystack processed against your KES limits
    if (verifiedAmount < 50 || verifiedAmount > 50000) {
      return { error: `Transaction amount out of allowed bounds (${formatKES(50)} - ${formatKES(50000)})` };
    }

    // 3. Get current authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "User not authenticated" };

    // 4. Update Balance in Supabase
    const { error: updateError } = await supabase.rpc('deposit_funds', {
      p_user_id: user.id,
      p_amount: verifiedAmount,
      p_reference_id: reference
    });

    if (updateError) return { error: updateError.message || "Failed to update balance" };

    const { data: profile } = await supabase
      .from("profiles")
      .select("balance")
      .eq("id", user.id)
      .single();

    return {
      success: true,
      newBalance: profile?.balance || 0,
      formattedBalance: formatKES(profile?.balance || 0),
      message: `Successfully deposited ${formatKES(verifiedAmount)}`
    };
  }

  return { error: "Transaction verification failed" };
}

// Payout details shape shared between client and server
export type PayoutDetails = {
  method: 'mpesa' | 'bank';
  phone?: string;
  accountNumber?: string;
  bankName?: string;
};

/**
 * WITHDRAWAL: Request funds for payout
 * Accepts optional payout details (M-PESA phone or bank account) and
 * stores them in the payout_details JSONB column on withdrawal_requests.
 */
export async function requestWithdrawal(amount: number, payoutDetails?: PayoutDetails) {
  const supabase = await createClient();

  // 1. Limit Check (Minimum KES 500, Maximum KES 50,000)
  if (amount < 500) return { error: `Minimum withdrawal is ${formatKES(500)}` };
  if (amount > 50000) return { error: `Maximum withdrawal is ${formatKES(50000)}` };

  // Validate payout details when provided
  if (payoutDetails) {
    if (payoutDetails.method === 'mpesa' && !payoutDetails.phone?.trim()) {
      return { error: "M-PESA phone number is required" };
    }
    if (payoutDetails.method === 'bank') {
      if (!payoutDetails.accountNumber?.trim()) return { error: "Bank account number is required" };
      if (!payoutDetails.bankName?.trim()) return { error: "Bank name is required" };
    }
  }

  // Get current authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "User not authenticated" };

  // 2. Execute secure request RPC (deducts balance, creates the row)
  const { error: rpcError } = await supabase.rpc('request_withdrawal', {
    p_amount: amount
  });

  if (rpcError) {
    return { error: rpcError.message || "Failed to register withdrawal request" };
  }

  // 3. Attach payout details to the newly created withdrawal_requests row
  if (payoutDetails) {
    const { data: latestRequest } = await supabase
      .from("withdrawal_requests")
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (latestRequest?.id) {
      await supabase
        .from("withdrawal_requests")
        .update({ payout_details: payoutDetails })
        .eq("id", latestRequest.id);
    }
  }

  // 4. Refetch balance
  const { data: profile } = await supabase
    .from("profiles")
    .select("balance")
    .eq("id", user.id)
    .single();

  return {
    success: true,
    newBalance: profile?.balance || 0,
    message: `Withdrawal request for ${formatKES(amount)} submitted for processing.`
  };
}