import { db } from "@/lib/db";
import { timeAgo } from "@/lib/utils";
import type { Metadata } from "next";
import MarkResolvedButton from "./mark-resolved-button";

export const metadata: Metadata = { title: "Feedback — Admin" };

export default async function AdminFeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ resolved?: string; category?: string }>;
}) {
  const sp       = await searchParams;
  const resolved = sp.resolved === "true";
  const category = sp.category ?? "";

  const [feedback, totalCount, resolvedCount, categories] = await Promise.all([
    db.feedback.findMany({
      where: {
        resolved,
        ...(category ? { category } : {}),
      },
      orderBy: { createdAt: "desc" },
    }),
    db.feedback.count(),
    db.feedback.count({ where: { resolved: true } }),
    db.feedback.groupBy({ by: ["category"], _count: true }),
  ]);

  return (
    <div className="p-6 max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title">Feedback &amp; Contact</h1>
        <p className="page-subtitle">Messages submitted through the Contact page.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="stat-icon bg-brand-100 text-brand-700">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-3">{totalCount}</p>
          <p className="text-sm text-gray-500 mt-0.5">Total</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-amber-100 text-amber-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-3">{totalCount - resolvedCount}</p>
          <p className="text-sm text-gray-500 mt-0.5">Open</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-emerald-100 text-emerald-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-3">{resolvedCount}</p>
          <p className="text-sm text-gray-500 mt-0.5">Resolved</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <a
          href="/admin/feedback"
          className={`btn btn-sm ${!resolved && !category ? "btn-primary" : "btn-ghost text-gray-600"}`}
        >
          Open
        </a>
        <a
          href="/admin/feedback?resolved=true"
          className={`btn btn-sm ${resolved ? "btn-primary" : "btn-ghost text-gray-600"}`}
        >
          Resolved
        </a>
        {categories.map((c) => (
          <a
            key={c.category}
            href={`/admin/feedback?category=${c.category}${resolved ? "&resolved=true" : ""}`}
            className={`btn btn-sm ${category === c.category ? "btn-accent" : "btn-ghost text-gray-600"}`}
          >
            {c.category}
            <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-xs px-1 bg-black/10 font-semibold">
              {c._count}
            </span>
          </a>
        ))}
      </div>

      {feedback.length === 0 ? (
        <div className="empty-state">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
          </div>
          <p className="text-sm text-gray-500">No {resolved ? "resolved" : "open"} feedback.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedback.map((fb) => (
            <div key={fb.id} className="card p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <p className="font-semibold text-gray-900">{fb.subject}</p>
                    <span className="badge badge-blue">{fb.category}</span>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5">
                    <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                    <strong className="text-gray-700">{fb.name}</strong>
                    {fb.email && (
                      <>
                        <span className="text-gray-300">·</span>
                        <a href={`mailto:${fb.email}`} className="text-brand-700 hover:underline">{fb.email}</a>
                      </>
                    )}
                    <span className="text-gray-300">·</span>
                    <span>{timeAgo(fb.createdAt)}</span>
                  </p>
                </div>
                {!fb.resolved && <MarkResolvedButton feedbackId={fb.id} />}
                {fb.resolved && (
                  <span className="badge badge-green flex items-center gap-1.5">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                    Resolved
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-xl p-4 leading-relaxed whitespace-pre-wrap">
                {fb.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
