import crypto from "crypto";

export const SESSION_COOKIE = "cc_session";

function secret(): string {
  return process.env.APP_PASSWORD ?? "";
}

export function checkPassword(input: string): boolean {
  const expected = secret();
  if (!expected) return false;
  // constant-time compare
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// Token = HMAC(secret, "valid"). Deterministic so the proxy can verify
// statelessly without a session store.
export function makeSessionToken(): string {
  return crypto.createHmac("sha256", secret()).update("valid").digest("hex");
}

export function isValidToken(token: string | undefined): boolean {
  if (!token) return false;
  const expected = makeSessionToken();
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
