import { db } from "@/lib/db";
import { timeAgo } from "@/lib/utils";
import type { Metadata } from "next";
import MemoryModerationButtons from "./moderation-buttons";

export const metadata: Metadata = { title: "Memories — Admin" };

const TYPE_BADGE: Record<string, string> = {
  STORY:     "badge-blue",
  MILESTONE: "badge-green",
  FUNNY:     "badge-amber",
  PHOTO:     "bg-pink-100 text-pink-700 border border-pink-200",
};

export default async function AdminMemoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp     = await searchParams;
  const status = (sp.status ?? "PENDING") as "PENDING" | "APPROVED" | "REJECTED";

  const memories = await db.memory.findMany({
    where: { status },
    orderBy: { createdAt: "desc" },
  });

  const counts = await db.memory.groupBy({
    by: ["status"],
    _count: true,
  });

  const countMap = Object.fromEntries(counts.map((c) => [c.status, c._count]));

  const tabConfig = {
    PENDING:  { label: "Pending",  color: "text-amber-600 border-amber-500" },
    APPROVED: { label: "Approved", color: "text-emerald-600 border-emerald-500" },
    REJECTED: { label: "Rejected", color: "text-red-600 border-red-500" },
  };

  return (
    <div className="p-6 max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title">GIKI Yaadein Moderation</h1>
        <p className="page-subtitle">Review and approve campus memories.</p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {(["PENDING", "APPROVED", "REJECTED"] as const).map((s) => (
          <a
            key={s}
            href={`/admin/memories?status=${s}`}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-2
              ${status === s
                ? `${tabConfig[s].color}`
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
          >
            {tabConfig[s].label}
            <span className={`inline-flex items-center justify-center min-w-[20px] h-5 rounded-full text-xs px-1.5 font-semibold
              ${status === s ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"}`}>
              {countMap[s] ?? 0}
            </span>
          </a>
        ))}
      </div>

      {memories.length === 0 ? (
        <div className="empty-state">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <p className="text-sm text-gray-500">No {status.toLowerCase()} memories.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {memories.map((memory) => (
            <div key={memory.id} className="card p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`badge ${TYPE_BADGE[memory.type] ?? "badge-gray"}`}>
                      {memory.type}
                    </span>
                    <span className="text-xs text-gray-400">{timeAgo(memory.createdAt)}</span>
                  </div>
                  <p className="font-semibold text-gray-900">{memory.locationName}</p>
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    {memory.lat.toFixed(4)}, {memory.lng.toFixed(4)}
                  </p>
                </div>
                {status === "PENDING" && <MemoryModerationButtons memoryId={memory.id} />}
              </div>

              <p className="text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-xl p-3.5 leading-relaxed">
                {memory.message}
              </p>

              {memory.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={memory.imageUrl} alt="" className="mt-3 rounded-xl max-h-52 object-cover w-full" />
              )}

              <div className="flex items-center gap-1.5 mt-3">
                <svg className="w-3.5 h-3.5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
                </svg>
                <span className="text-xs text-gray-400">{memory.likes} likes</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
