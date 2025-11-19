import { Resend } from "resend";

const client = new Resend(process.env.AUTH_RESEND_KEY as string);

export async function sendVerificationEmail(to: string, token: string) {
  const url = `${process.env.AUTH_URL}/auth/verify?token=${encodeURIComponent(
    token
  )}`;
  const body = `Click the link to complete signup:\n\n${url}\n\nIf you didn't request this, ignore.`;
  return client.emails.send({
    from: process.env.AUTH_RESEND_FROM as string,
    to,
    subject: "Complete your Respondo signup",
    text: body,
    html: `<p>Click <a href="${url}">here</a> to complete your signup. The link expires in ${
      process.env.VERIFICATION_TOKEN_EXPIRY_MINUTES || 60
    } minutes.</p>`,
  });
}
