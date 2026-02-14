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
    const { data: profile } = await supabase
      .from("profiles")
      .select("balance")
      .eq("id", user.id)
      .single();

    const currentBalance = profile?.balance || 0;
    const newBalance = currentBalance + verifiedAmount;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ balance: newBalance })
      .eq("id", user.id);

    if (updateError) return { error: "Failed to update balance" };
    
    return { 
      success: true, 
      newBalance, 
      formattedBalance: formatKES(newBalance),
      message: `Successfully deposited ${formatKES(verifiedAmount)}`
    };
  }

  return { error: "Transaction verification failed" };
}

/**
 * WITHDRAWAL: Deduct funds with KES 50 - 50,000 limits
 */
export async function withdrawFunds(amount: number) {
  const supabase = await createClient();

  // 1. Limit Check
  if (amount < 50) return { error: `Minimum withdrawal is ${formatKES(50)}` };
  if (amount > 50000) return { error: `Maximum withdrawal is ${formatKES(50000)}` };

  // 2. Get User & Current Balance
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "User not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("balance")
    .eq("id", user.id)
    .single();

  const currentBalance = profile?.balance || 0;

  // 3. Check Sufficient Funds
  if (currentBalance < amount) {
    return { error: `Insufficient funds. Your current balance is ${formatKES(currentBalance)}` };
  }

  // 4. Update Balance (Deduct funds)
  const newBalance = currentBalance - amount;

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ balance: newBalance })
    .eq("id", user.id);

  if (updateError) return { error: "Failed to process withdrawal" };

  return { 
    success: true, 
    newBalance, 
    formattedBalance: formatKES(newBalance),
    message: `Withdrawal of ${formatKES(amount)} has been initiated.`
  };
}