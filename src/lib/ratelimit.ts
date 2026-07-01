import { headers } from "next/headers";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Rate limiting is OPT-IN and fails open: if the Upstash env vars aren't set,
// every check passes so there is zero UX impact until you enable it.
//
// To turn it on, create a free Upstash Redis DB (upstash.com) and set:
//   UPSTASH_REDIS_REST_URL
//   UPSTASH_REDIS_REST_TOKEN
// in your local .env.local and in Vercel project env vars.

const configured =
  !!process.env.UPSTASH_REDIS_REST_URL &&
  !!process.env.UPSTASH_REDIS_REST_TOKEN;

// A sliding window: max 10 auth attempts per IP per 60 seconds.
const limiter = configured
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, "60 s"),
      prefix: "htracker:auth",
      analytics: false,
    })
  : null;

// Best-effort client IP from proxy headers.
function clientIp(): string {
  const h = headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Returns { ok: true } when the action may proceed. When Upstash isn't
 * configured, always returns ok. Never throws — on transient errors it fails
 * open so a rate-limiter outage can't lock users out.
 */
export async function rateLimit(
  bucket: string,
): Promise<{ ok: boolean; retryAfter?: number }> {
  if (!limiter) return { ok: true };
  try {
    const { success, reset } = await limiter.limit(`${bucket}:${clientIp()}`);
    return { ok: success, retryAfter: Math.max(0, reset - Date.now()) };
  } catch {
    return { ok: true };
  }
}
