import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongoDB";
import Credentials from "next-auth/providers/credentials";
import { getUserByEmail, verifyPassword } from "@/utils/authHelper";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  pages: {
    signIn: "/auth/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("[AUTH DEBUG] Authorize function called");

        if (!credentials) {
          console.log("[AUTH DEBUG] No credentials supplied");
          return null;
        }

        const { email, password } = credentials;
        console.log(`[AUTH DEBUG] Attempting login for email: ${email}`);

        // 1. Check User Lookup
        const user = await getUserByEmail(email as string);

        if (!user) {
          console.log("[AUTH DEBUG] User NOT found in database.");
          return null;
        }

        console.log(
          "[AUTH DEBUG] User found in DB. Checking for password field..."
        );

        // 2. Check if user has a password (handling potential OAuth-only users)
        if (!user.passwordHash) {
          console.log(
            "[AUTH DEBUG] User found, but has NO password field (User might be OAuth-only)."
          );
          return null;
        }

        // 3. Verify Password
        console.log("[AUTH DEBUG] Verifying password...");
        const valid = await verifyPassword(
          password as string,
          user.passwordHash as string
        );

        console.log(`[AUTH DEBUG] Password validity: ${valid}`);

        if (!valid) {
          console.log(
            "[AUTH DEBUG] Password verification FAILED. Returning null."
          );
          return null;
        }

        console.log("[AUTH DEBUG] Login SUCCESS. Returning user object.");

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  callbacks: {
    async session({ session, token, user }) {
      if (token?.sub) session.user!.id = token.sub;
      return session;
    },

    authorized: ({ auth }) => {
      return !!auth;
    },
  },
});
