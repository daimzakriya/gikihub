import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { generalLimiter, checkRateLimit } from "@/lib/rate-limit";
import { getIp } from "@/lib/utils";

const FeedbackSchema = z.object({
  name:     z.string().min(1).max(100),
  email:    z.string().email().max(200).optional().or(z.literal("")),
  subject:  z.string().min(1).max(200),
  category: z.string().max(50).default("General"),
  message:  z.string().min(5).max(2000),
});

export async function POST(req: NextRequest) {
  const ip      = getIp(req);
  const limited = await checkRateLimit(generalLimiter, ip);
  if (limited) return limited;

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = FeedbackSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });

  const { email, ...rest } = parsed.data;
  await db.feedback.create({
    data: { ...rest, email: email || "" },
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
