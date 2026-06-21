import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { timeAgo } from "@/lib/utils";
import ReviewForm from "./review-form";
import type { Metadata } from "next";

export const revalidate = 120;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const prof = await db.professor.findUnique({ where: { id } });
  return { title: prof ? `${prof.name} Reviews — GIKI Plus` : "Professor" };
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`w-4 h-4 ${i < Math.round(rating) ? "text-amber-400" : "text-gray-200"}`}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
      <span className="text-sm font-semibold text-gray-700 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

const RATING_LABELS: Record<string, string> = {
  ratingTeach:   "Teaching Quality",
  ratingGrade:   "Grading Fairness",
  ratingLoad:    "Course Workload",
  ratingComm:    "Communication",
  ratingOverall: "Overall",
};

export default async function ProfessorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const professor = await db.professor.findUnique({
    where: { id, approvedAt: { not: null } },
    include: {
      reviews: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!professor) notFound();

  const reviews    = professor.reviews;
  const count      = reviews.length;
  const avgRatings = count > 0 ? {
    ratingTeach:    reviews.reduce((s, r) => s + r.ratingTeach,    0) / count,
    ratingGrade:    reviews.reduce((s, r) => s + r.ratingGrade,    0) / count,
    ratingLoad:     reviews.reduce((s, r) => s + r.ratingLoad,     0) / count,
    ratingComm:     reviews.reduce((s, r) => s + r.ratingComm,     0) / count,
    ratingOverall:  reviews.reduce((s, r) => s + r.ratingOverall,  0) / count,
  } : null;

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      {/* Back link */}
      <Link href="/professors"
        className="inline-flex items-center gap-1.5 text-sm text-brand-700 hover:text-brand-900 font-medium mb-8 group">
        <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
        All professors
      </Link>

      {/* Professor hero card */}
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-brand-700 font-black text-2xl">{professor.name.charAt(0)}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{professor.name}</h1>
              <p className="text-gray-500 mt-0.5 text-sm">{professor.department}</p>
              {professor.courses.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {professor.courses.map((c) => (
                    <span key={c} className="badge badge-gray">{c}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {avgRatings && (
            <div className="text-center bg-amber-50 border border-amber-200 rounded-2xl p-5 flex-shrink-0">
              <p className="text-4xl font-black text-amber-500 leading-none">{avgRatings.ratingOverall.toFixed(1)}</p>
              <p className="text-xs text-amber-700 mt-1.5 font-medium">Overall Rating</p>
              <p className="text-xs text-gray-400 mt-0.5">{count} review{count !== 1 ? "s" : ""}</p>
            </div>
          )}
        </div>

        {/* Rating breakdown */}
        {avgRatings && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Rating Breakdown</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.keys(RATING_LABELS) as Array<keyof typeof avgRatings>).map((key) => (
                <div key={key} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-gray-600 w-36 flex-shrink-0">{RATING_LABELS[key]}</span>
                  <div className="flex items-center gap-2 flex-1">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-2 bg-amber-400 rounded-full transition-all"
                        style={{ width: `${(avgRatings[key] / 5) * 100}%` }} />
                    </div>
                    <span className="text-sm font-bold text-gray-700 w-8 text-right">{avgRatings[key].toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Review Form */}
      <ReviewForm professorId={id} professorName={professor.name} />

      {/* Reviews list */}
      <div className="mt-10">
        <h2 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
          <span>Student Reviews</span>
          <span className="badge badge-gray">{count}</span>
        </h2>

        {reviews.map((review) => (
          <div key={review.id} className="card p-5 mb-4">
            <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
              <div>
                <StarDisplay rating={review.ratingOverall} />
                <div className="flex gap-3 mt-2 text-xs text-gray-500 flex-wrap">
                  {review.courseCode && (
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/>
                      </svg>
                      {review.courseCode}
                    </span>
                  )}
                  {review.semester && (
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5"/>
                      </svg>
                      {review.semester}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">{timeAgo(review.createdAt)}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                { label: "Teaching",      val: review.ratingTeach   },
                { label: "Grading",       val: review.ratingGrade   },
                { label: "Workload",      val: review.ratingLoad    },
                { label: "Communication", val: review.ratingComm    },
              ].map((r) => (
                <div key={r.label} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2 text-xs">
                  <span className="text-gray-500">{r.label}</span>
                  <span className="font-bold text-gray-800">{r.val}/5</span>
                </div>
              ))}
            </div>

            {review.comment && (
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl px-4 py-3 mt-1">&ldquo;{review.comment}&rdquo;</p>
            )}
          </div>
        ))}

        {count === 0 && (
          <div className="empty-state">
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/>
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800">No reviews yet</h3>
            <p className="text-gray-500 text-sm mt-1">Be the first to review this professor!</p>
          </div>
        )}
      </div>
    </main>
  );
}
