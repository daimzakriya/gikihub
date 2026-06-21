import Link from "next/link";
import { db } from "@/lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Professor Reviews — GIKI Plus" };
export const revalidate = 300;

const DEPTS = [
  "Computer Science", "Electrical", "Mechanical", "Civil", "Chemical",
  "Engineering Sciences", "Humanities", "Management Sciences",
];

function StarDisplay({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <svg key={i} className={`w-3.5 h-3.5 ${i < Math.round(rating) ? "text-amber-400" : "text-gray-200"}`}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </span>
  );
}

export default async function ProfessorsPage({
  searchParams,
}: {
  searchParams: Promise<{ dept?: string; q?: string }>;
}) {
  const sp   = await searchParams;
  const dept = sp.dept ?? "";
  const q    = sp.q ?? "";

  const professors = await db.professor.findMany({
    where: {
      approvedAt: { not: null },
      ...(dept ? { department: dept } : {}),
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
    },
    include: {
      reviews: {
        where: { status: "APPROVED" },
        select: {
          teachingRating: true, gradingRating: true, workloadRating: true,
          availableRating: true, overallRating: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  // Compute average overall rating per professor
  const profData = professors.map((p) => {
    const count = p.reviews.length;
    const avg   = count > 0
      ? p.reviews.reduce((s, r) => s + r.overallRating, 0) / count
      : null;
    return { ...p, reviewCount: count, avgOverall: avg };
  });

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="page-title">Professor Reviews</h1>
        <p className="page-subtitle">Anonymous student ratings for GIKI faculty.</p>
      </div>

      {/* Filters */}
      <form method="get" className="card p-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input type="text" name="q" defaultValue={q} placeholder="Search by name…"
              className="input pl-10 w-full" />
          </div>
          <select name="dept" defaultValue={dept} className="input sm:w-60">
            <option value="">All departments</option>
            {DEPTS.map((d) => <option key={d}>{d}</option>)}
          </select>
          <button type="submit" className="btn btn-primary whitespace-nowrap">
            Search
          </button>
        </div>

        {/* Department pill filters */}
        {dept && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
            <span className="badge badge-brand">{dept}</span>
            <a href="/professors" className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
              Clear filter ×
            </a>
          </div>
        )}
      </form>

      {/* Results count */}
      {profData.length > 0 && (
        <p className="text-sm text-gray-500 mb-4">
          Showing <strong className="text-gray-900">{profData.length}</strong> professor{profData.length !== 1 ? "s" : ""}
          {(q || dept) && " matching your search"}
        </p>
      )}

      {/* Empty state */}
      {profData.length === 0 && (
        <div className="empty-state">
          <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">No professors found</h3>
          <p className="text-gray-500 text-sm mt-2">
            {q || dept ? "Try a different search or department." : "No professors have been approved yet."}
          </p>
          {(q || dept) && (
            <a href="/professors" className="btn btn-outline mt-4 inline-flex">Clear filters</a>
          )}
        </div>
      )}

      {/* Professor grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {profData.map((prof) => (
          <Link key={prof.id} href={`/professors/${prof.id}`}
            className="card card-interactive group flex flex-col">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0 flex-1">
                <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center mb-3">
                  <span className="text-brand-700 font-bold text-sm">{prof.name.charAt(0)}</span>
                </div>
                <p className="font-bold text-gray-900 group-hover:text-brand-700 transition-colors truncate text-sm">{prof.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{prof.department}</p>
              </div>
              {prof.avgOverall !== null && (
                <div className="flex-shrink-0 text-center bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                  <p className="text-xl font-black text-amber-500 leading-none">{prof.avgOverall.toFixed(1)}</p>
                  <p className="text-xs text-amber-600 mt-0.5">/5</p>
                </div>
              )}
            </div>

            {prof.avgOverall !== null && (
              <div className="mb-3">
                <StarDisplay rating={prof.avgOverall} />
              </div>
            )}

            <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                {prof.reviewCount} review{prof.reviewCount !== 1 ? "s" : ""}
              </p>
              {prof.courses.length > 0 && (
                <p className="text-xs text-gray-400 truncate max-w-[60%] text-right">
                  {prof.courses.slice(0, 2).join(", ")}
                  {prof.courses.length > 2 ? ` +${prof.courses.length - 2}` : ""}
                </p>
              )}
            </div>
            {prof.reviewCount === 0 && (
              <p className="text-xs text-amber-600 mt-2 font-medium">Be the first to review →</p>
            )}
          </Link>
        ))}
      </div>

      <p className="text-center text-xs text-gray-400 mt-10">
        All reviews are anonymous and go through moderation before appearing.
      </p>
    </main>
  );
}
