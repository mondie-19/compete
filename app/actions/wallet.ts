"use server";
import { createClient } from "@/supabase/server"; // Adjust path to your Supabase server client

export async function verifyAndAddFunds(reference: string, amount: number) {
  const supabase = await createClient();

  // 1. Verify transaction with Paystack API
  const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    },
  });

  const data = await response.json();

  if (data.status && data.data.status === "success") {
    const depositAmount = data.data.amount / 100; // Convert back from Kobo/Cents

    // 2. Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "User not authenticated" };

    // 3. Update Balance (Assuming a 'profiles' table with a 'balance' column)
    const { data: profile } = await supabase
      .from("profiles")
      .select("balance")
      .eq("id", user.id)
      .single();

    const newBalance = (profile?.balance || 0) + depositAmount;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ balance: newBalance })
      .eq("id", user.id);

    if (updateError) return { error: "Failed to update balance" };
    
    return { success: true, newBalance };
  }

  return { error: "Transaction verification failed" };
}