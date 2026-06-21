import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getIp, hashIp } from "@/lib/utils";
import { reviewLimiter, checkRateLimit } from "@/lib/rate-limit";

const ReviewSchema = z.object({
  professorId:     z.string().uuid(),
  courseCode:      z.string().max(20).optional(),
  semester:        z.string().max(20).optional(),
  teachingRating:  z.number().int().min(1).max(5),
  gradingRating:   z.number().int().min(1).max(5),
  workloadRating:  z.number().int().min(1).max(5),
  availableRating: z.number().int().min(1).max(5),
  overallRating:   z.number().int().min(1).max(5),
  comment:         z.string().max(1000).optional(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = ReviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const { professorId, ...rest } = parsed.data;

  const ip      = getIp(req);
  const limited = await checkRateLimit(reviewLimiter, `review:${ip}:${professorId}`);
  if (limited) return limited;

  // Verify professor exists and is approved
  const professor = await db.professor.findUnique({ where: { id: professorId } });
  if (!professor || !professor.approvedAt) {
    return NextResponse.json({ error: "Professor not found." }, { status: 404 });
  }

  const ipHash = await hashIp(ip);

  // Prevent duplicate reviews from same IP for same professor
  const existing = await db.professorReview.findFirst({
    where: { professorId, ipHash },
  });
  if (existing) {
    return NextResponse.json({ error: "You have already reviewed this professor." }, { status: 409 });
  }

  const review = await db.professorReview.create({
    data: {
      professorId,
      ipHash,
      status:          "PENDING",
      teachingRating:  rest.teachingRating,
      gradingRating:   rest.gradingRating,
      workloadRating:  rest.workloadRating,
      availableRating: rest.availableRating,
      overallRating:   rest.overallRating,
      courseCode:      rest.courseCode  ?? "",
      semester:        rest.semester    ?? "",
      comment:         rest.comment     ?? "",
    },
  });

  return NextResponse.json({ success: true, id: review.id }, { status: 201 });
}
