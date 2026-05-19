import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    // Use service role key to bypass RLS for this backend operation
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Upsert subscriber
    const { error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .upsert({ email: email.trim().toLowerCase() }, { onConflict: "email" });

    if (error) {
      console.error("Supabase upsert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Send confirmation email via Resend
    await resend.emails.send({
      from: "Compete <noreply@competehq.gg>",
      to: email.trim().toLowerCase(),
      subject: "You're on the list — Compete Tournaments",
      html: `
        <div style="background:#000;color:#fff;font-family:sans-serif;padding:40px;max-width:560px;margin:0 auto;border:1px solid #1a1a1a;border-radius:16px;">
          <div style="display:inline-block;background:#9B5CFF20;border:1px solid #9B5CFF40;padding:8px 16px;border-radius:100px;margin-bottom:24px;">
            <span style="color:#9B5CFF;font-size:11px;font-weight:900;letter-spacing:0.3em;text-transform:uppercase;">Tournament Alert</span>
          </div>
          <h1 style="font-size:32px;font-weight:900;margin:0 0 8px;font-style:italic;letter-spacing:-1px;">You're In.</h1>
          <p style="color:#888;font-size:14px;line-height:1.6;margin:0 0 24px;">
            You'll be the first to know when Compete Tournaments go live — bracket info, prize breakdowns, and your seat at the table, straight to your inbox.
          </p>
          <div style="background:#111;border:1px solid #1a1a1a;border-radius:12px;padding:20px;margin-bottom:24px;">
            <p style="color:#9B5CFF;font-size:10px;font-weight:900;letter-spacing:0.3em;text-transform:uppercase;margin:0 0 8px;">You'll receive</p>
            <ul style="color:#aaa;font-size:13px;margin:0;padding-left:20px;line-height:2;">
              <li>Tournament launch announcements</li>
              <li>Bracket info &amp; registration windows</li>
              <li>Prize pool breakdowns</li>
            </ul>
          </div>
          <a href="https://compete.gg/tournaments" style="display:inline-block;background:#9B5CFF;color:#fff;font-size:11px;font-weight:900;letter-spacing:0.2em;text-transform:uppercase;padding:14px 32px;border-radius:100px;text-decoration:none;">
            View Tournaments
          </a>
          <p style="color:#444;font-size:10px;margin-top:32px;">
            No spam. Unsubscribe at any time. Compete HQ — ${email}
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Newsletter subscribe error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
