import { db } from "@/lib/db";
import { timeAgo } from "@/lib/utils";
import type { Metadata } from "next";
import AddProfessorForm from "./add-form";
import ModerationButtons from "./moderation-buttons";

export const metadata: Metadata = { title: "Professor Reviews — Admin" };

export default async function AdminProfessorsPage() {
  const [professors, pendingReviews] = await Promise.all([
    db.professor.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { reviews: true } } },
    }),
    db.professorReview.findMany({
      where: { status: "PENDING" },
      include: { professor: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalReviews = professors.reduce((s, p) => s + p._count.reviews, 0);

  return (
    <div className="p-6 max-w-5xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="page-title">Professor Reviews</h1>
        <p className="page-subtitle">Manage professors and moderate student reviews.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="stat-icon bg-brand-100 text-brand-700">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-3">{professors.length}</p>
          <p className="text-sm text-gray-500 mt-0.5">Total Professors</p>
        </div>
        <div className={`stat-card ${pendingReviews.length > 0 ? "border-amber-200 bg-amber-50/50" : ""}`}>
          <div className={`stat-icon ${pendingReviews.length > 0 ? "bg-amber-100 text-amber-600" : "bg-gray-100 text-gray-500"}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            </svg>
          </div>
          <p className={`text-2xl font-bold mt-3 ${pendingReviews.length > 0 ? "text-amber-600" : "text-gray-900"}`}>{pendingReviews.length}</p>
          <p className="text-sm text-gray-500 mt-0.5">Pending Reviews</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-blue-100 text-blue-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-3">{totalReviews}</p>
          <p className="text-sm text-gray-500 mt-0.5">Total Reviews</p>
        </div>
      </div>

      {/* Add professor form */}
      <AddProfessorForm />

      {/* Pending reviews */}
      {pendingReviews.length > 0 && (
        <div className="card overflow-hidden border-amber-200">
          <div className="px-6 py-4 border-b border-amber-100 bg-amber-50/60 flex items-center gap-3">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse flex-shrink-0" />
            <h2 className="font-semibold text-gray-900">Pending Moderation</h2>
            <span className="badge badge-amber ml-auto">{pendingReviews.length} reviews</span>
          </div>
          <div className="divide-y divide-gray-100">
            {pendingReviews.map((review) => (
              <div key={review.id} className="p-5 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
                  <div>
                    <p className="font-semibold text-gray-900">{review.professor.name}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-1.5">
                      {review.courseCode && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                          </svg>
                          {review.courseCode}
                        </span>
                      )}
                      {review.semester && <span>{review.semester}</span>}
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                        Overall {review.ratingOverall}/5
                      </span>
                      <span className="text-gray-400">{timeAgo(review.createdAt)}</span>
                    </div>
                  </div>
                  <ModerationButtons reviewId={review.id} />
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs mb-4">
                  {[
                    { l: "Teaching",  v: review.ratingTeach  },
                    { l: "Grading",   v: review.ratingGrade  },
                    { l: "Workload",  v: review.ratingLoad   },
                    { l: "Comm.",     v: review.ratingComm   },
                  ].map((r) => (
                    <div key={r.l} className="bg-gray-50 border border-gray-100 rounded-lg p-2.5 text-center">
                      <p className="text-gray-400 text-xs">{r.l}</p>
                      <p className="font-bold text-gray-800 mt-0.5">{r.v}/5</p>
                    </div>
                  ))}
                </div>
                {review.comment && (
                  <p className="text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-xl p-3.5 leading-relaxed">
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Professors list */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">All Professors</h2>
          <span className="badge badge-gray">{professors.length} total</span>
        </div>
        {professors.length === 0 ? (
          <div className="empty-state">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <p className="text-sm text-gray-500">No professors added yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Reviews</th>
                  <th>Added</th>
                </tr>
              </thead>
              <tbody>
                {professors.map((prof) => (
                  <tr key={prof.id}>
                    <td className="font-medium text-gray-900">{prof.name}</td>
                    <td className="text-gray-600">{prof.department}</td>
                    <td>
                      <span className="badge badge-blue">
                        {prof._count.reviews} reviews
                      </span>
                    </td>
                    <td className="text-gray-400 text-xs">
                      {prof.approvedAt ? timeAgo(prof.approvedAt) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
