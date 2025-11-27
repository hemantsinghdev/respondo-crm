import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoose";
import { VerificationToken } from "@/models";
import { sendVerificationEmail } from "@/lib/resend";
import crypto from "crypto";

export async function POST(req: Request) {
  await connectToDB();
  const { email } = await req.json();
  if (!email)
    return NextResponse.json({ error: "Email required" }, { status: 400 });

  // create token
  const token = crypto.randomBytes(32).toString("hex");
  const minutes = parseInt(
    process.env.VERIFICATION_TOKEN_EXPIRY_MINUTES || "60",
    10
  );
  const expiresAt = new Date(Date.now() + minutes * 60 * 1000);

  const tokenCreated = await VerificationToken.create({
    email: email.toLowerCase(),
    token,
    expiresAt,
  });
  if (tokenCreated) {
    await sendVerificationEmail(email, token);

    // --- DEVELOPMENT ONLY ---
    const verificationUrl = `${
      process.env.BASE_URL
    }/auth/verify?token=${encodeURIComponent(token)}`;
    return NextResponse.json({
      ok: true,
      verificationLink: verificationUrl, // <-- NEW FIELD
    });
    // ------------------------

    // return NextResponse.json({ ok: true });
  } else {
    return NextResponse.json({ ok: false, message: "something went wrong" });
  }
}
