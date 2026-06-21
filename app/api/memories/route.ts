import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getIp, hashIp } from "@/lib/utils";
import { memoryLimiter, generalLimiter, checkRateLimit } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";

// Must match CAMPUS_BOUNDS in map-component.tsx
const CAMPUS_LAT = { min: 34.058, max: 34.092 };
const CAMPUS_LNG = { min: 72.625, max: 72.668 };

const MemorySchema = z.object({
  locationName: z.string().min(2).max(100),
  lat:          z.number().min(CAMPUS_LAT.min).max(CAMPUS_LAT.max),
  lng:          z.number().min(CAMPUS_LNG.min).max(CAMPUS_LNG.max),
  message:      z.string().min(5).max(500),
  type:         z.enum(["STORY", "MILESTONE", "FUNNY", "PHOTO"]),
});

export async function GET() {
  const memories = await db.memory.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, locationName: true, lat: true, lng: true,
      message: true, type: true, imageUrl: true, likes: true, createdAt: true,
    },
  });
  return NextResponse.json({ memories });
}

export async function POST(req: NextRequest) {
  const ip      = getIp(req);
  const limited = await checkRateLimit(memoryLimiter, ip);
  if (limited) return limited;

  const ipHash = await hashIp(ip);

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = MemorySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });

  const memory = await db.memory.create({
    data: { ...parsed.data, ipHash, status: "PENDING" },
  });

  return NextResponse.json({ success: true, id: memory.id }, { status: 201 });
}

// Like / unlike a memory
export async function PATCH(req: NextRequest) {
  const ip      = getIp(req);
  const limited = await checkRateLimit(generalLimiter, `like:${ip}`);
  if (limited) return limited;

  const ipHash = await hashIp(ip);

  const { memoryId } = await req.json().catch(() => ({})) as { memoryId?: string };
  if (!memoryId) return NextResponse.json({ error: "memoryId required" }, { status: 400 });

  const existing = await db.memoryLike.findUnique({
    where: { memoryId_ipHash: { memoryId, ipHash } },
  });

  if (existing) {
    await db.$transaction([
      db.memoryLike.delete({ where: { id: existing.id } }),
      db.memory.update({ where: { id: memoryId }, data: { likes: { decrement: 1 } } }),
    ]);
    return NextResponse.json({ liked: false });
  } else {
    await db.$transaction([
      db.memoryLike.create({ data: { memoryId, ipHash } }),
      db.memory.update({ where: { id: memoryId }, data: { likes: { increment: 1 } } }),
    ]);
    return NextResponse.json({ liked: true });
  }
}

export async function PUT(req: NextRequest) {
  const ip      = getIp(req);
  const limited = await checkRateLimit(generalLimiter, `upload:${ip}`);
  if (limited) return limited;

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Invalid form data" }, { status: 400 });

  const file = form.get("image") as File | null;
  if (!file) return NextResponse.json({ error: "No image" }, { status: 400 });

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type)) return NextResponse.json({ error: "Image must be JPEG, PNG, WebP or GIF" }, { status: 400 });
  if (file.size > 5 * 1024 * 1024)  return NextResponse.json({ error: "Max 5 MB" }, { status: 400 });

  const ext      = file.name.split(".").pop() ?? "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const bytes    = await file.arrayBuffer();

  const supabase = createAdminClient();
  const { data, error } = await supabase.storage.from("memory-images")
    .upload(filename, bytes, { contentType: file.type });

  if (error) return NextResponse.json({ error: "Upload failed" }, { status: 500 });

  const { data: { publicUrl } } = supabase.storage.from("memory-images").getPublicUrl(data.path);
  return NextResponse.json({ url: publicUrl });
}
