import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { lostFoundLimiter, checkRateLimit } from "@/lib/rate-limit";
import { getIp } from "@/lib/utils";

const SUPABASE_STORAGE_PATTERN = /^https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\//;

const PostSchema = z.object({
  type:        z.enum(["lost", "found"]),
  title:       z.string().min(2).max(100),
  description: z.string().min(5).max(500),
  category:    z.string().max(50).default("Other"),
  location:    z.string().min(2).max(100),
  imageUrl:    z.string().url().refine(
    (url) => SUPABASE_STORAGE_PATTERN.test(url),
    { message: "Image must be hosted on the app's storage" }
  ).optional(),
});

export async function GET() {
  const posts = await db.lostFoundPost.findMany({
    where: { expiresAt: { gt: new Date() } },
    orderBy: [{ resolved: "asc" }, { createdAt: "desc" }],
    select: {
      // contactToken intentionally excluded — it's a private ownership credential
      id: true, type: true, title: true, description: true,
      category: true, location: true, imageUrl: true, resolved: true,
      createdAt: true,
    },
  });
  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  const ip = getIp(req);
  const limited = await checkRateLimit(lostFoundLimiter, ip);
  if (limited) return limited;

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = PostSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });

  const contactToken = nanoid(32);
  const expiresAt    = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  const post = await db.lostFoundPost.create({
    data: { ...parsed.data, contactToken, expiresAt },
  });

  return NextResponse.json({ success: true, id: post.id, contactToken }, { status: 201 });
}
