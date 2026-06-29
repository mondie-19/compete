import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/email";
import { NewsletterEmail } from "@/app/emails/NewsletterEmail";
import * as React from "react";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const normalised = email?.trim().toLowerCase();

    if (!normalised || !normalised.includes("@")) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .upsert({ email: normalised }, { onConflict: "email" });

    if (error) {
      console.error("Supabase upsert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await sendEmail({
      to: normalised,
      subject: "You're on the list — Compete",
      react: React.createElement(NewsletterEmail, { email: normalised }),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Newsletter subscribe error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
