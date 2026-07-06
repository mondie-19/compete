import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/email";
import * as React from "react";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const CATEGORY_LABELS: Record<string, string> = {
  game:     "Game Suggestion",
  platform: "Platform Suggestion",
  bug:      "Bug Report",
  feedback: "General Feedback",
};

export async function POST(req: Request) {
  try {
    const { category, message, email } = await req.json();

    if (!category || !message?.trim()) {
      return NextResponse.json({ error: "Category and message are required." }, { status: 400 });
    }

    const label = CATEGORY_LABELS[category] ?? category;

    // Save to Supabase
    await supabaseAdmin.from("feedback").insert({
      category,
      message: message.trim(),
      email: email?.trim().toLowerCase() || null,
    });

    // Notify internal team
    await sendEmail({
      to: "competehq@gmail.com",
      subject: `[${label}] New submission — Compete`,
      react: React.createElement(
        "div",
        { style: { fontFamily: "monospace", padding: "24px", backgroundColor: "#0A0A0F", color: "#fff", maxWidth: "560px" } },
        React.createElement("div", { style: { color: "#9B5CFF", fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "8px" } }, label),
        React.createElement("div", { style: { fontSize: "18px", fontWeight: "bold", marginBottom: "20px" } }, "New Submission"),
        React.createElement("div", { style: { backgroundColor: "#0F0F16", border: "1px solid #1e1e2e", borderRadius: "8px", padding: "16px", marginBottom: "16px", whiteSpace: "pre-wrap", fontSize: "13px", color: "#a0a0b8", lineHeight: "1.6" } }, message.trim()),
        email ? React.createElement("div", { style: { fontSize: "11px", color: "#7c7c99" } }, `From: ${email.trim()}`) : null
      ),
    });

    // If they left an email, save to newsletter_subscribers too
    if (email?.includes("@")) {
      await supabaseAdmin
        .from("newsletter_subscribers")
        .upsert({ email: email.trim().toLowerCase() }, { onConflict: "email" });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Feedback error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
