"use server";

import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ── Update a user's role ──────────────────────────────────────
export async function updateRoleAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Only SUPER_ADMIN can change roles
  const current = await db.profile.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  if (!current || current.role !== "SUPER_ADMIN") return;

  const Schema = z.object({
    userId: z.string().uuid(),
    role:   z.enum(["SUPER_ADMIN", "ADMIN", "MODERATOR", "STAFF"]),
  });

  const parsed = Schema.safeParse({
    userId: formData.get("userId"),
    role:   formData.get("role"),
  });
  if (!parsed.success) return;

  // Prevent downgrading yourself
  if (parsed.data.userId === user.id) return;

  await db.profile.update({
    where: { id: parsed.data.userId },
    data:  { role: parsed.data.role },
  });

  revalidatePath("/admin/users");
}

// ── Toggle a user's active status ─────────────────────────────
export async function toggleActiveAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const current = await db.profile.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  if (!current || current.role !== "SUPER_ADMIN") return;

  const userId = formData.get("userId") as string;
  if (!z.string().uuid().safeParse(userId).success) return;
  if (userId === user.id) return;

  const target = await db.profile.findUnique({
    where: { id: userId },
    select: { isActive: true },
  });
  if (!target) return;

  await db.profile.update({
    where: { id: userId },
    data:  { isActive: !target.isActive },
  });

  revalidatePath("/admin/users");
}
