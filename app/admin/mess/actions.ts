"use server";

import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

// ── Upload new mess menu ───────────────────────────────────────
export async function uploadMessMenuAction(
  formData: FormData
): Promise<{ error?: string } | void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  // ADMIN or STAFF can update the mess menu
  const profile = await db.profile.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  if (!profile || !["SUPER_ADMIN", "ADMIN", "STAFF"].includes(profile.role)) {
    return { error: "Insufficient permissions." };
  }

  const label = (formData.get("label") as string)?.trim();
  if (!label || label.length < 3) return { error: "Please enter a label for this menu." };

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "No file selected." };
  if (file.size > MAX_SIZE) return { error: "File exceeds 10 MB limit." };
  if (!ALLOWED_TYPES.includes(file.type)) return { error: "Only PDF, JPEG, PNG, or WebP files are allowed." };

  const isImage = file.type.startsWith("image/");
  const ext     = file.name.split(".").pop() ?? (isImage ? "jpg" : "pdf");
  const fileName = `${Date.now()}-mess-menu.${ext}`;
  const bytes   = await file.arrayBuffer();

  const adminClient = createAdminClient();
  const { data: storageData, error: storageError } = await adminClient.storage
    .from("mess-menus")
    .upload(fileName, bytes, {
      contentType:  file.type,
      cacheControl: "3600",
      upsert:       false,
    });

  if (storageError || !storageData) {
    return { error: "Upload failed: " + storageError?.message };
  }

  const { data: urlData } = adminClient.storage
    .from("mess-menus")
    .getPublicUrl(storageData.path);

  try {
    await db.messMenu.create({
      data: {
        label,
        fileUrl:      urlData.publicUrl,
        fileName,
        fileType:     isImage ? "image" : "pdf",
        fileSize:     file.size,
        uploadedById: user.id,
      },
    });
  } catch {
    await adminClient.storage.from("mess-menus").remove([fileName]);
    return { error: "Failed to save menu record." };
  }

  revalidatePath("/admin/mess");
  revalidatePath("/mess");
}

// ── Delete a mess menu entry ───────────────────────────────────
export async function deleteMessMenuAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const profile = await db.profile.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  if (!profile || !["SUPER_ADMIN", "ADMIN"].includes(profile.role)) return;

  const id       = formData.get("id")       as string;
  const fileName = formData.get("fileName") as string;
  if (!id) return;

  const adminClient = createAdminClient();
  await adminClient.storage.from("mess-menus").remove([fileName]);
  await db.messMenu.delete({ where: { id } });

  revalidatePath("/admin/mess");
  revalidatePath("/mess");
}
