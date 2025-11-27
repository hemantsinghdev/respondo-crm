import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoose";
import { VerificationToken, User } from "@/models";
import { hashPassword } from "@/utils/hash";

export async function POST(req: Request) {
  const body = await req.json();
  const { token, name, organization, website, address, password } = body;
  if (!token)
    return NextResponse.json({ error: "Token required" }, { status: 400 });

  await connectToDB();

  const doc = await VerificationToken.findOne({ token });
  if (!doc)
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  if (doc.expiresAt.getTime() < Date.now())
    return NextResponse.json({ error: "Token expired" }, { status: 400 });

  const existing = await User.findOne({ email: doc.email });
  if (existing)
    return NextResponse.json({ error: "User already exists" }, { status: 400 });

  const passwordHash = await hashPassword(password);
  const user = await User.create({
    email: doc.email,
    name,
    organization,
    website,
    address,
    passwordHash,
  });

  // delete token
  await VerificationToken.deleteOne({ _id: doc._id });

  return NextResponse.json({ ok: true, email: user.email });
}
