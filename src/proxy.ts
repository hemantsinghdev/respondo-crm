import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth(async function proxy(req) {
  if (!req.auth && req.nextUrl.pathname !== "/auth/login") {
    const newUrl = new URL("/auth/login", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/", "/profile"],
};
