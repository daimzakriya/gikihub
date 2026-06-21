import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { generalLimiter, checkRateLimit } from "@/lib/rate-limit";
import { getIp } from "@/lib/utils";

const MessageSchema = z.object({ message: z.string().min(1).max(500) });

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip      = getIp(req);
  const limited = await checkRateLimit(generalLimiter, ip);
  if (limited) return limited;

  const { id } = await params;

  const post = await db.lostFoundPost.findUnique({ where: { id } });
  if (!post || post.resolved) return NextResponse.json({ error: "Post not found or resolved" }, { status: 404 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = MessageSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Message is required" }, { status: 422 });

  const senderToken = nanoid(16);
  await db.lostFoundMessage.create({
    data: { postId: id, senderToken, message: parsed.data.message },
  });

  return NextResponse.json({ success: true, senderToken }, { status: 201 });
}
