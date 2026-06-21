"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import Papa from "papaparse";
import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const profile = await db.profile.findUnique({ where: { id: user.id } });
  if (!profile || !["SUPER_ADMIN", "ADMIN"].includes(profile.role)) {
    throw new Error("Insufficient permissions");
  }
  return profile;
}

const RoomSchema = z.object({
  name:     z.string().min(1),
  block:    z.string().min(1),
  type:     z.string().min(1),
  capacity: z.coerce.number().int().positive(),
  floor:    z.coerce.number().int().min(0),
});

const SlotSchema = z.object({
  roomName:    z.string().min(1),
  block:       z.string().min(1),
  type:        z.string().default("Lecture Hall"),
  capacity:    z.coerce.number().int().positive().default(60),
  floor:       z.coerce.number().int().min(0).default(0),
  day:         z.string().min(1),
  startTime:   z.string().regex(/^\d{2}:\d{2}$/),
  endTime:     z.string().regex(/^\d{2}:\d{2}$/),
  courseCode:  z.string().min(1),
  courseName:  z.string().min(1),
  section:     z.string().default(""),
  teacherName: z.string().default(""),
  semester:    z.string().default(""),
});

export async function uploadTimetableAction(_: unknown, formData: FormData) {
  try {
    await requireAdmin();

    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) return { error: "Please select a CSV file." };
    if (!file.name.endsWith(".csv")) return { error: "Only CSV files are accepted." };
    if (file.size > 5 * 1024 * 1024) return { error: "File must be under 5 MB." };

    const text = await file.text();
    const parsed = Papa.parse(text, { header: true, skipEmptyLines: true, transformHeader: (h) => h.trim() });

    if (parsed.errors.length > 0) {
      return { error: `CSV parse error: ${parsed.errors[0].message}` };
    }

    const rows = parsed.data as Record<string, string>[];
    if (rows.length === 0) return { error: "CSV file is empty." };

    // Normalize headers (case-insensitive)
    const normalizedRows = rows.map((row) => {
      const n: Record<string, string> = {};
      for (const [k, v] of Object.entries(row)) {
        n[k.toLowerCase().replace(/\s+/g, "")] = String(v).trim();
      }
      return n;
    });

    // Expected CSV columns (case-insensitive): roomname, block, type, capacity, floor, day, starttime, endtime, coursecode, coursename, section, teachername, semester
    const slotParsed = normalizedRows.map((r, i) => SlotSchema.safeParse({
      roomName:    r.roomname ?? r.room,
      block:       r.block,
      type:        r.type ?? "Lecture Hall",
      capacity:    r.capacity ?? 60,
      floor:       r.floor ?? 0,
      day:         r.day,
      startTime:   r.starttime ?? r.start,
      endTime:     r.endtime ?? r.end,
      courseCode:  r.coursecode ?? r.course,
      courseName:  r.coursename ?? r.name ?? r.title,
      section:     r.section ?? "",
      teacherName: r.teachername ?? r.teacher ?? "",
      semester:    r.semester ?? "",
    }));

    const badRows = slotParsed.map((p, i) => (!p.success ? i + 2 : null)).filter(Boolean);
    if (badRows.length > 0) {
      return { error: `Invalid data in rows: ${badRows.slice(0, 5).join(", ")}. Check required columns.` };
    }

    const slots = slotParsed.map((p) => (p as { success: true; data: z.infer<typeof SlotSchema> }).data);

    // Upsert rooms, then bulk-insert slots
    await db.$transaction(async (tx) => {
      // Clear existing timetable slots (full refresh)
      await tx.timetableSlot.deleteMany({});

      // Collect unique rooms
      const uniqueRooms = new Map<string, z.infer<typeof RoomSchema>>();
      for (const slot of slots) {
        const key = `${slot.block}__${slot.roomName}`;
        if (!uniqueRooms.has(key)) {
          uniqueRooms.set(key, {
            name:     slot.roomName,
            block:    slot.block,
            type:     slot.type,
            capacity: slot.capacity,
            floor:    slot.floor,
          });
        }
      }

      // Delete rooms not in new timetable
      await tx.room.deleteMany({});

      // Insert rooms
      const insertedRooms = await Promise.all(
        [...uniqueRooms.values()].map((r) =>
          tx.room.create({ data: r })
        )
      );

      const roomMap = new Map<string, string>();
      for (const r of insertedRooms) {
        roomMap.set(`${r.block}__${r.name}`, r.id);
      }

      // Insert slots
      await tx.timetableSlot.createMany({
        data: slots.map((s) => ({
          roomId:      roomMap.get(`${s.block}__${s.roomName}`)!,
          day:         s.day,
          startTime:   s.startTime,
          endTime:     s.endTime,
          courseCode:  s.courseCode,
          courseName:  s.courseName,
          section:     s.section,
          teacherName: s.teacherName,
          semester:    s.semester,
        })),
        skipDuplicates: true,
      });
    });

    revalidatePath("/room-finder");
    revalidatePath("/admin/rooms");
    return { success: true, count: slots.length };
  } catch (err) {
    console.error("[uploadTimetableAction]", err);
    return { error: err instanceof Error ? err.message : "Upload failed." };
  }
}

export async function deleteTimetableAction() {
  try {
    await requireAdmin();
    await db.$transaction([
      db.timetableSlot.deleteMany({}),
      db.room.deleteMany({}),
    ]);
    revalidatePath("/room-finder");
    revalidatePath("/admin/rooms");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed." };
  }
}
