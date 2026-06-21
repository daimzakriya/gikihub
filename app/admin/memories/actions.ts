"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

async function requireModerator() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const profile = await db.profile.findUnique({ where: { id: user.id } });
  if (!profile || !["SUPER_ADMIN", "ADMIN", "MODERATOR"].includes(profile.role)) {
    throw new Error("Insufficient permissions");
  }
  return profile;
}

export async function moderateMemoryAction(id: string, status: "APPROVED" | "REJECTED") {
  try {
    await requireModerator();
    await db.memory.update({ where: { id }, data: { status } });
    revalidatePath("/memories");
    revalidatePath("/admin/memories");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed." };
  }
}

export async function deleteMemoryAction(id: string) {
  try {
    await requireModerator();
    await db.memory.delete({ where: { id } });
    revalidatePath("/memories");
    revalidatePath("/admin/memories");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed." };
  }
}
