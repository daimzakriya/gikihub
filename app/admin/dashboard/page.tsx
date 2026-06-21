import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";

async function getStats() {
  const [
    pendingReviews,
    pendingMemories,
    pendingEvents,
    totalProfessors,
    totalUsers,
    recentSchedules,
    unresolvedFeedback,
  ] = await Promise.all([
    db.professorReview.count({ where: { status: "PENDING" } }),
    db.memory.count({ where: { status: "PENDING" } }),
    db.campusEvent.count({ where: { status: "PENDING" } }),
    db.professor.count({ where: { isActive: true } }),
    db.profile.count({ where: { isActive: true } }),
    db.examSchedule.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, title: true, examType: true, semester: true, notifiedAt: true, createdAt: true },
    }),
    db.feedback.count({ where: { resolved: false } }),
  ]);

  return {
    pendingReviews,
    pendingMemories,
    pendingEvents,
    totalProfessors,
    totalUsers,
    recentSchedules,
    unresolvedFeedback,
  };
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const stats = await getStats();

  const statCards = [
    {
      label: "Pending Reviews",
      value: stats.pendingReviews,
      urgent: stats.pendingReviews > 0,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      href: "/admin/professors",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
        </svg>
      ),
    },
    {
      label: "Pending Memories",
      value: stats.pendingMemories,
      urgent: stats.pendingMemories > 0,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      href: "/admin/memories",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
      ),
    },
    {
      label: "Pending Events",
      value: stats.pendingEvents,
      urgent: stats.pendingEvents > 0,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      href: "/admin/events",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
      ),
    },
    {
      label: "Open Feedback",
      value: stats.unresolvedFeedback,
      urgent: stats.unresolvedFeedback > 5,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      href: "/admin/feedback",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
        </svg>
      ),
    },
    {
      label: "Active Professors",
      value: stats.totalProfessors,
      urgent: false,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      href: "/admin/professors",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
      ),
    },
    {
      label: "Total Users",
      value: stats.totalUsers,
      urgent: false,
      iconBg: "bg-brand-100",
      iconColor: "text-brand-700",
      href: "/admin/users",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-8 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of GIKI Plus activity</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <a key={card.label} href={card.href} className="stat-card group">
            <div className="flex items-start justify-between">
              <div className={`stat-icon ${card.iconBg} ${card.iconColor}`}>
                {card.icon}
              </div>
              {card.urgent && (
                <span className="badge badge-amber">Needs attention</span>
              )}
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              <p className="text-sm text-gray-500 mt-1 font-medium">{card.label}</p>
            </div>
          </a>
        ))}
      </div>

      {/* Recent exam schedules */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Recent Exam Schedules</h2>
          <a href="/admin/exam-schedule" className="text-xs text-brand-700 hover:text-brand-900 font-medium">
            View all â†’
          </a>
        </div>
        {stats.recentSchedules.length === 0 ? (
          <div className="empty-state">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <p className="text-sm text-gray-500">No schedules uploaded yet.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Semester</th>
                  <th>Notification</th>
                  <th>Uploaded</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentSchedules.map((s) => (
                  <tr key={s.id}>
                    <td className="font-medium text-gray-900">{s.title}</td>
                    <td>
                      <span className={`badge ${
                        s.examType === "MID"   ? "badge-amber" :
                        s.examType === "FINAL" ? "badge-red" :
                        "badge-gray"}`}>
                        {s.examType}
                      </span>
                    </td>
                    <td className="text-gray-600">{s.semester}</td>
                    <td>
                      {s.notifiedAt ? (
                        <span className="badge badge-green">Sent {formatDate(s.notifiedAt)}</span>
                      ) : (
                        <span className="badge badge-gray">Not sent</span>
                      )}
                    </td>
                    <td className="text-gray-500 text-xs">{formatDate(s.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Upload Exam Schedule", href: "/admin/exam-schedule", icon: "ðŸ“„" },
            { label: "Upload Mess Menu", href: "/admin/mess", icon: "ðŸ½ï¸" },
            { label: "Moderate Memories", href: "/admin/memories", icon: "ðŸ“¸" },
            { label: "View Feedback", href: "/admin/feedback", icon: "ðŸ’¬" },
          ].map((action) => (
            <a
              key={action.label}
              href={action.href}
              className="card card-hover flex items-center gap-3 p-4 text-sm font-medium text-gray-700 hover:text-brand-900"
            >
              <span className="text-xl">{action.icon}</span>
              <span>{action.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

