import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { WelcomeEmail } from "@/app/emails/WelcomeEmail";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let email: string, password: string, username: string;

  try {
    ({ email, password, username } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  email    = (email    ?? "").trim().toLowerCase();
  username = (username ?? "").trim();
  password = (password ?? "");

  if (!email || !password || !username) {
    return NextResponse.json({ error: "Email, password, and username are required." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (username.length < 3 || username.length > 32) {
    return NextResponse.json({ error: "Username must be 3–32 characters." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const url            = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    console.error("[signup] Missing Supabase env vars");
    return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
  }

  const admin = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Derive the origin from the incoming request so the verification link
  // always points to the correct domain in every environment — no env var needed.
  const { origin } = new URL(request.url);
  const redirectTo = `${origin}/auth/callback`;

  // admin.generateLink creates the user AND returns a real verification token
  // without triggering Supabase's own confirmation email.
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "signup",
    email,
    password,
    options: {
      data: { username },
      redirectTo,
    },
  });

  if (linkError) {
    const msg = linkError.message ?? "";
    const alreadyExists = /already registered|already exists|user already/i.test(msg);
    return NextResponse.json(
      { error: alreadyExists ? "An account with this email already exists. Try signing in instead." : "Could not create account. Please try again." },
      { status: 400 }
    );
  }

  const verificationLink = linkData.properties.action_link;

  const emailResult = await sendEmail({
    to: email,
    subject: "Verify your Compete account",
    react: WelcomeEmail({ username, verificationLink }),
  });

  if (!emailResult.success) {
    // User was created — return success anyway so they can request a resend.
    console.error("[signup] Email send failed for", email, emailResult.error);
  }

  return NextResponse.json({ success: true });
}
