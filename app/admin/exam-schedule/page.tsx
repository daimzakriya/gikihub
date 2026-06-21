import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ExamScheduleUploadForm } from "./upload-form";
import { broadcastAction, deleteScheduleAction } from "./actions";
import { formatDate, formatBytes } from "@/lib/utils";
import type { Role } from "@/types";
import { hasPermission } from "@/types";

export default async function ExamSchedulePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const profile = await db.profile.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  if (!profile) redirect("/auth/login");

  const canUpload = hasPermission(profile.role as Role, "ADMIN");

  const schedules = await db.examSchedule.findMany({
    orderBy: { createdAt: "desc" },
  });

  const notifiedCount = schedules.filter((s) => s.notifiedAt).length;

  return (
    <div className="p-6 space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="page-title">Exam Schedules</h1>
        <p className="page-subtitle">
          Upload exam schedules and broadcast push notifications to all students.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="stat-icon bg-brand-100 text-brand-700">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-3">{schedules.length}</p>
          <p className="text-sm text-gray-500 mt-0.5">Total Schedules</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-emerald-100 text-emerald-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-3">{notifiedCount}</p>
          <p className="text-sm text-gray-500 mt-0.5">Students Notified</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-amber-100 text-amber-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-3">{schedules.length - notifiedCount}</p>
          <p className="text-sm text-gray-500 mt-0.5">Pending Notification</p>
        </div>
      </div>

      {/* Upload form â€” only ADMIN+ can see this */}
      {canUpload && <ExamScheduleUploadForm userId={user.id} />}

      {/* Existing schedules */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">All Schedules</h2>
          <span className="badge badge-gray">{schedules.length} files</span>
        </div>

        {schedules.length === 0 ? (
          <div className="empty-state">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <p className="text-sm text-gray-500">No exam schedules uploaded yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {schedules.map((s) => (
              <div
                key={s.id}
                className="card card-hover flex items-center gap-4 p-5"
              >
                {/* File type badge */}
                <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-red-500">PDF</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{s.title}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="badge badge-gray">{s.semester}</span>
                    <span className={`badge ${s.examType === "FINAL" ? "badge-red" : s.examType === "MID" ? "badge-amber" : "badge-gray"}`}>
                      {s.examType}
                    </span>
                    <span className="text-xs text-gray-400">{formatBytes(s.fileSize)}</span>
                    <span className="text-xs text-gray-400">Uploaded {formatDate(s.createdAt)}</span>
                  </div>
                </div>

                {/* Notification status */}
                <div className="flex-shrink-0">
                  {s.notifiedAt ? (
                    <span className="badge badge-green flex items-center gap-1.5">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                      </svg>
                      Notified {formatDate(s.notifiedAt)}
                    </span>
                  ) : (
                    <form action={broadcastAction}>
                      <input type="hidden" name="scheduleId" value={s.id} />
                      <input type="hidden" name="title"      value={s.title} />
                      <input type="hidden" name="semester"   value={s.semester} />
                      <input type="hidden" name="examType"   value={s.examType} />
                      <input type="hidden" name="fileUrl"    value={s.fileUrl} />
                      <button
                        type="submit"
                        className="btn btn-sm btn-primary flex items-center gap-1.5"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V5a1 1 0 10-2 0v.083A6 6 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                        </svg>
                        Notify students
                      </button>
                    </form>
                  )}
                </div>

                {/* View + Delete */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href={s.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-ghost text-brand-700"
                  >
                    View
                  </a>
                  {canUpload && (
                    <form action={deleteScheduleAction}>
                      <input type="hidden" name="scheduleId" value={s.id} />
                      <input type="hidden" name="fileName"   value={s.fileName} />
                      <button
                        type="submit"
                        className="btn btn-sm btn-danger"
                        onClick={(e) => {
                          if (!confirm(`Delete "${s.title}"? This cannot be undone.`)) {
                            e.preventDefault();
                          }
                        }}
                      >
                        Delete
                      </button>
                    </form>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

