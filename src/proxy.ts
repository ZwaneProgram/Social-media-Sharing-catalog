import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isValidToken, SESSION_COOKIE } from "@/lib/auth";

export function proxy(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (isValidToken(token)) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  return NextResponse.redirect(url);
}

// Protect everything except login page, login API, and static assets.
export const config = {
  matcher: [
    "/((?!login$|api/login|_next/|favicon.ico|manifest.json|sw.js|icons/).*)",
  ],
};
