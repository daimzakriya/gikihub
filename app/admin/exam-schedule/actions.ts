"use server";

import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import webpush from "web-push";
import { z } from "zod";
import type { PushPayload } from "@/types";

// Configure VAPID keys once
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

// ── Upload exam schedule ───────────────────────────────────────
export async function uploadScheduleAction(
  formData: FormData
): Promise<{ error?: string } | void> {
  const supabase     = await createClient();
  const adminClient  = createAdminClient();

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  // Role check
  const profile = await db.profile.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  if (!profile || !["SUPER_ADMIN", "ADMIN"].includes(profile.role)) {
    return { error: "Insufficient permissions." };
  }

  // Validate fields
  const Schema = z.object({
    title:    z.string().min(3).max(120),
    semester: z.string().min(2).max(50),
    examType: z.enum(["MID", "FINAL", "QUIZ", "OTHER"]),
  });

  const parsed = Schema.safeParse({
    title:    formData.get("title"),
    semester: formData.get("semester"),
    examType: formData.get("examType"),
  });

  if (!parsed.success) {
    return { error: "Invalid form data. " + parsed.error.issues[0].message };
  }

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "No file selected." };

  const MAX_SIZE  = 10 * 1024 * 1024; // 10 MB
  const ALLOWED   = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

  if (file.size > MAX_SIZE) return { error: "File exceeds 10 MB limit." };
  if (!ALLOWED.includes(file.type)) return { error: "Invalid file type." };

  // Upload to Supabase Storage
  const ext       = file.name.split(".").pop() ?? "pdf";
  const fileName  = `${Date.now()}-${parsed.data.examType.toLowerCase()}-${parsed.data.semester.replace(/\s+/g, "-")}.${ext}`;
  const bytes     = await file.arrayBuffer();

  const { data: storageData, error: storageError } = await adminClient.storage
    .from("exam-schedules")
    .upload(fileName, bytes, {
      contentType:  file.type,
      cacheControl: "3600",
      upsert:       false,
    });

  if (storageError || !storageData) {
    return { error: "Failed to upload file: " + storageError?.message };
  }

  // Get public URL
  const { data: urlData } = adminClient.storage
    .from("exam-schedules")
    .getPublicUrl(storageData.path);

  // Save record to DB
  await db.examSchedule.create({
    data: {
      title:        parsed.data.title,
      examType:     parsed.data.examType,
      semester:     parsed.data.semester,
      fileUrl:      urlData.publicUrl,
      fileName,
      fileSize:     file.size,
      uploadedById: user.id,
    },
  });

  revalidatePath("/admin/exam-schedule");
  revalidatePath("/admin/dashboard");
}

// ── Broadcast push notification ────────────────────────────────
export async function broadcastAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const actorProfile = await db.profile.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  if (!actorProfile || !["SUPER_ADMIN", "ADMIN"].includes(actorProfile.role)) return;

  const scheduleId = formData.get("scheduleId") as string;
  const title      = formData.get("title")      as string;
  const semester   = formData.get("semester")   as string;
  const examType   = formData.get("examType")   as string;
  const fileUrl    = formData.get("fileUrl")    as string;

  if (!scheduleId) return;

  // Mark as notified (prevent double-sends)
  const schedule = await db.examSchedule.findUnique({ where: { id: scheduleId } });
  if (!schedule || schedule.notifiedAt) return;

  await db.examSchedule.update({
    where: { id: scheduleId },
    data:  { notifiedAt: new Date() },
  });

  // Fetch all push subscriptions
  const subscriptions = await db.pushSubscription.findMany();
  if (subscriptions.length === 0) return;

  const payload: PushPayload = {
    title: `📅 ${examType} Schedule Released`,
    body:  `${title} — ${semester} is now available. Tap to view.`,
    icon:  "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    url:   fileUrl,
    tag:   `exam-schedule-${scheduleId}`,
  };

  const payloadStr = JSON.stringify(payload);

  // Send to all subscribers in parallel, remove dead subscriptions
  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dhKey,
            auth:   sub.authKey,
          },
        },
        payloadStr
      )
    )
  );

  // Clean up expired/invalid subscriptions (410 Gone)
  const toDelete: string[] = [];
  results.forEach((result, i) => {
    if (
      result.status === "rejected" &&
      (result.reason?.statusCode === 410 || result.reason?.statusCode === 404)
    ) {
      toDelete.push(subscriptions[i].id);
    }
  });

  if (toDelete.length > 0) {
    await db.pushSubscription.deleteMany({ where: { id: { in: toDelete } } });
  }

  revalidatePath("/admin/exam-schedule");
  revalidatePath("/admin/dashboard");
}

// ── Delete exam schedule ───────────────────────────────────────
export async function deleteScheduleAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const profile = await db.profile.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  if (!profile || !["SUPER_ADMIN", "ADMIN"].includes(profile.role)) return;

  const scheduleId = formData.get("scheduleId") as string;
  const fileName   = formData.get("fileName")   as string;

  if (!scheduleId) return;

  // Remove from storage
  const adminClient = createAdminClient();
  await adminClient.storage.from("exam-schedules").remove([fileName]);

  // Remove from DB
  await db.examSchedule.delete({ where: { id: scheduleId } });

  revalidatePath("/admin/exam-schedule");
  revalidatePath("/admin/dashboard");
}
