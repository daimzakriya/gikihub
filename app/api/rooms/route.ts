import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const QuerySchema = z.object({
  day:       z.string().optional(),
  block:     z.string().optional(),
  type:      z.string().optional(),
  time:      z.string().regex(/^\d{2}:\d{2}$/, "time must be HH:MM").optional(),
  available: z.enum(["true", "false"]).optional(),
});

export async function GET(req: NextRequest) {
  const sp = Object.fromEntries(req.nextUrl.searchParams.entries());
  const parsed = QuerySchema.safeParse(sp);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { day, block, type, time, available } = parsed.data;

  const rooms = await db.room.findMany({
    where: {
      ...(block ? { block } : {}),
      ...(type  ? { type  } : {}),
    },
    include: {
      timetableSlots: {
        where: day ? { day } : undefined,
      },
    },
    orderBy: [{ block: "asc" }, { name: "asc" }],
  });

  // If available=true and time+day provided, filter rooms with no overlapping slot
  let result = rooms;
  if (available === "true" && day && time) {
    result = rooms.filter((room) => {
      const [h, m] = time.split(":").map(Number);
      const queryMinutes = h * 60 + m;
      return !room.timetableSlots.some((slot) => {
        const [sh, sm] = slot.startTime.split(":").map(Number);
        const [eh, em] = slot.endTime.split(":").map(Number);
        return queryMinutes >= sh * 60 + sm && queryMinutes < eh * 60 + em;
      });
    });
  }

  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const blocks  = [...new Set(rooms.map((r) => r.block))].sort();
  const types   = [...new Set(rooms.map((r) => r.type))].sort();

  return NextResponse.json({ rooms: result, blocks, types, days: DAYS });
}
