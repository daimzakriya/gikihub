import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { lostFoundLimiter, checkRateLimit } from "@/lib/rate-limit";
import { getIp } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const ip = getIp(req);
  const limited = await checkRateLimit(lostFoundLimiter, `lf-upload:${ip}`);
  if (limited) return limited;

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Invalid form data" }, { status: 400 });

  const file = form.get("image") as File | null;
  if (!file) return NextResponse.json({ error: "No image" }, { status: 400 });

  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) return NextResponse.json({ error: "JPEG, PNG or WebP only" }, { status: 400 });
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "Max 5 MB" }, { status: 400 });

  const ext      = file.name.split(".").pop() ?? "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const bytes    = await file.arrayBuffer();

  const supabase = createAdminClient();
  const { data, error } = await supabase.storage.from("lost-found-images")
    .upload(filename, bytes, { contentType: file.type });

  if (error) return NextResponse.json({ error: "Upload failed" }, { status: 500 });

  const { data: { publicUrl } } = supabase.storage.from("lost-found-images").getPublicUrl(data.path);
  return NextResponse.json({ url: publicUrl });
}
