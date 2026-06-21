import { db } from "@/lib/db";
import { formatDate, formatBytes } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Exam Schedules — GIKI Plus" };
export const revalidate = 300;

const EXAM_TYPE_COLORS: Record<string, string> = {
  MID:   "badge-amber",
  FINAL: "badge-red",
  QUIZ:  "badge-blue",
  OTHER: "badge-gray",
};

export default async function ExamSchedulePage() {
  const schedules = await db.examSchedule.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="page-title">Exam Schedules</h1>
        <p className="page-subtitle">Download official exam schedules uploaded by admin.</p>
      </div>

      {schedules.length === 0 ? (
        <div className="empty-state">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">No schedules uploaded yet</h3>
          <p className="text-gray-400 text-sm mt-2">Check back before your exams — schedules will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {schedules.map((schedule) => (
            <div key={schedule.id}
              className="card card-hover p-5 flex items-center gap-4 flex-wrap">
              {/* File icon */}
              <div className="flex-shrink-0 w-12 h-12 bg-brand-50 border border-brand-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
                </svg>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <h3 className="font-semibold text-gray-900 truncate text-sm">{schedule.title}</h3>
                  <span className={`badge ${EXAM_TYPE_COLORS[schedule.examType] ?? EXAM_TYPE_COLORS.OTHER}`}>
                    {schedule.examType}
                  </span>
                  {schedule.notifiedAt && (
                    <span className="badge badge-green">
                      Notified
                    </span>
                  )}
                </div>
                <div className="flex gap-3 text-xs text-gray-400 flex-wrap">
                  {schedule.semester && (
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25"/>
                      </svg>
                      {schedule.semester}
                    </span>
                  )}
                  <span>{formatBytes(schedule.fileSize)}</span>
                  <span>Uploaded {formatDate(schedule.createdAt)}</span>
                </div>
              </div>

              <a href={schedule.fileUrl} target="_blank" rel="noopener noreferrer"
                className="btn btn-primary flex items-center gap-1.5 flex-shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                </svg>
                Download
              </a>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
