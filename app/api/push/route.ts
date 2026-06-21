// Push subscription management API
// POST /api/push  → subscribe
// DELETE /api/push → unsubscribe

import { db } from "@/lib/db";
import { generalLimiter, checkRateLimit } from "@/lib/rate-limit";
import { getIp, hashIp } from "@/lib/utils";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";

const SubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(10),
    auth:   z.string().min(10),
  }),
});

export async function POST(request: NextRequest) {
  // Rate limit
  const ip      = getIp(request);
  const limited = await checkRateLimit(generalLimiter, `push-subscribe:${ip}`);
  if (limited) return limited;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = SubscriptionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid subscription object" }, { status: 400 });
  }

  const { endpoint, keys } = parsed.data;

  // Upsert — if the same endpoint re-subscribes, update keys
  await db.pushSubscription.upsert({
    where:  { endpoint },
    create: {
      endpoint,
      p256dhKey: keys.p256dh,
      authKey:   keys.auth,
      ipHash:    hashIp(ip),
    },
    update: {
      p256dhKey: keys.p256dh,
      authKey:   keys.auth,
    },
  });

  return NextResponse.json({ success: true }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const ip      = getIp(request);
  const limited = await checkRateLimit(generalLimiter, `push-unsubscribe:${ip}`);
  if (limited) return limited;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { endpoint } = z.object({ endpoint: z.string() }).parse(body);

  await db.pushSubscription.deleteMany({ where: { endpoint } });

  return NextResponse.json({ success: true });
}
