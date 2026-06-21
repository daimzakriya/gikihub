"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
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

async function requireAdmin() {
  const profile = await requireModerator();
  if (!["SUPER_ADMIN", "ADMIN"].includes(profile.role)) throw new Error("Insufficient permissions");
  return profile;
}

const AddProfessorSchema = z.object({
  name:       z.string().min(2).max(100),
  department: z.string().min(2).max(100),
  courses:    z.string().transform((v) => v.split(",").map((s) => s.trim()).filter(Boolean)),
});

type ActionState = { error: string; success: boolean };

export async function addProfessorAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireAdmin();
    const parsed = AddProfessorSchema.safeParse({
      name:       formData.get("name"),
      department: formData.get("department"),
      courses:    formData.get("courses") ?? "",
    });
    if (!parsed.success) return { error: "Invalid data: " + JSON.stringify(parsed.error.flatten().fieldErrors), success: false };

    await db.professor.create({
      data: { ...parsed.data, approvedAt: new Date() },
    });
    revalidatePath("/professors");
    revalidatePath("/admin/professors");
    return { success: true, error: "" };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed.", success: false };
  }
}

export async function moderateReviewAction(reviewId: string, action: "approve" | "reject", note?: string) {
  try {
    await requireModerator();
    await db.professorReview.update({
      where: { id: reviewId },
      data: {
        status:         action === "approve" ? "APPROVED" : "REJECTED",
        moderationNote: note ?? null,
      },
    });
    revalidatePath("/admin/professors");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed." };
  }
}

export async function deleteProfessorAction(id: string) {
  try {
    await requireAdmin();
    await db.professor.delete({ where: { id } });
    revalidatePath("/professors");
    revalidatePath("/admin/professors");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed." };
  }
}
