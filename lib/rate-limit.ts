// Rate limiting via Upstash Redis
// Docs: https://github.com/upstash/ratelimit

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// One shared Redis instance
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// ── Prebuilt limiters ──────────────────────────────────────────

/** General API calls: 60 per minute per IP */
export const generalLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, "1 m"),
  prefix: "giki:general",
  analytics: true,
});

/** Professor reviews: 1 per professor per IP per 7 days */
export const reviewLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(1, "7 d"),
  prefix: "giki:review",
  analytics: true,
});

/** Memories: 3 per IP per day */
export const memoryLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 d"),
  prefix: "giki:memory",
  analytics: true,
});

/** Lost & Found posts: 5 per IP per day */
export const lostFoundLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 d"),
  prefix: "giki:lostfound",
  analytics: true,
});

/** AI chat: 10 messages per IP per day */
export const aiChatLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 d"),
  prefix: "giki:aichat",
  analytics: true,
});

/** Auth attempts: 5 per IP per 15 minutes (brute-force protection) */
export const authLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  prefix: "giki:auth",
  analytics: true,
});

// ── Helper ─────────────────────────────────────────────────────

/**
 * Check a rate limiter and return a Response if the limit is exceeded.
 * Returns null if the request is allowed.
 *
 * @example
 * const limited = await checkRateLimit(reviewLimiter, `${ip}:${professorId}`);
 * if (limited) return limited;
 */
export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<Response | null> {
  let success: boolean, limit: number, remaining: number, reset: number;
  try {
    ({ success, limit, remaining, reset } = await limiter.limit(identifier));
  } catch {
    // Rate limiter unavailable — allow the request
    return null;
  }

  if (!success) {
    return new Response(
      JSON.stringify({
        error: "Too many requests. Please try again later.",
        limit,
        remaining,
        reset,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": String(remaining),
          "X-RateLimit-Reset": String(reset),
          "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
        },
      }
    );
  }

  return null;
}
