"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const profile = await db.profile.findUnique({ where: { id: user.id } });
  if (!profile || !["SUPER_ADMIN", "ADMIN", "MODERATOR"].includes(profile.role)) {
    throw new Error("Insufficient permissions");
  }
  return profile;
}

const EventSchema = z.object({
  title:       z.string().min(2).max(200),
  description: z.string().max(1000).optional(),
  date:        z.string().min(1),
  startTime:   z.string().min(1),
  endTime:     z.string().optional(),
  location:    z.string().min(1).max(200),
  category:    z.string().max(50).default("Other"),
  organizer:   z.string().max(100).optional(),
});

type ActionState = { error: string; success: boolean };

export async function createEventAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireAdmin();
    const parsed = EventSchema.safeParse({
      title:       formData.get("title"),
      description: formData.get("description") || undefined,
      date:        formData.get("date"),
      startTime:   formData.get("startTime"),
      endTime:     formData.get("endTime") || undefined,
      location:    formData.get("location"),
      category:    formData.get("category") ?? "Other",
      organizer:   formData.get("organizer") || undefined,
    });
    if (!parsed.success) return { error: "Invalid data.", success: false };

    const d = parsed.data;
    await db.campusEvent.create({
      data: {
        title:       d.title,
        date:        new Date(d.date),
        startTime:   d.startTime,
        location:    d.location,
        category:    d.category,
        status:      "APPROVED",
        description: d.description ?? "",
        endTime:     d.endTime    ?? "",
        organizer:   d.organizer  ?? "",
      },
    });
    revalidatePath("/events");
    revalidatePath("/admin/events");
    return { success: true, error: "" };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed.", success: false };
  }
}
