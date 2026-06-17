import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { WelcomeEmail } from "@/app/emails/WelcomeEmail";

export async function POST(request: Request) {
  const { email, username } = await request.json();

  if (!email || !username) {
    return NextResponse.json({ error: "email and username are required" }, { status: 400 });
  }

  const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL || "https://compete.app"}/auth/verify?token=pending`;

  await sendEmail({
    to: email,
    subject: `Welcome to Compete, ${username}`,
    react: WelcomeEmail({ username, verificationLink }),
  });

  return NextResponse.json({ success: true });
}
