import crypto from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "4ang_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "SESSION_SECRET is missing or too short. Set a long random value in your environment (see .env.example)."
    );
  }
  return secret;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export function createSessionToken(username: string): string {
  const payload = Buffer.from(
    JSON.stringify({
      u: username,
      iat: Date.now(),
      exp: Date.now() + SESSION_TTL_SECONDS * 1000,
    })
  ).toString("base64url");
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof data.exp === "number" && data.exp > Date.now();
  } catch {
    return false;
  }
}

/** Validates a username/password pair against the admin credentials in env, in constant time. */
export function checkCredentials(username: string, password: string): boolean {
  const expectedUser = process.env.ADMIN_USERNAME || "";
  const expectedPass = process.env.ADMIN_PASSWORD || "";
  if (!expectedUser || !expectedPass) return false;

  const userOk = timingSafeStringEqual(username, expectedUser);
  const passOk = timingSafeStringEqual(password, expectedPass);
  return userOk && passOk;
}

function timingSafeStringEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b.padEnd(Math.max(a.length, b.length), "\0"));
  const aPadded = Buffer.from(a.padEnd(Math.max(a.length, b.length), "\0"));
  if (aPadded.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aPadded, bBuf) && a.length === b.length;
}

/** Server Component / Server Action / Route Handler helper — reads the session cookie via next/headers (async since Next.js 15). */
export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

export const SESSION_MAX_AGE = SESSION_TTL_SECONDS;
