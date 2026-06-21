import { db } from "@/lib/db";
import { timeAgo } from "@/lib/utils";
import type { Metadata } from "next";
import ResolveButton from "./resolve-button";

export const metadata: Metadata = { title: "Lost & Found — Admin" };

export default async function AdminLostFoundPage({
  searchParams,
}: {
  searchParams: Promise<{ resolved?: string }>;
}) {
  const sp       = await searchParams;
  const resolved = sp.resolved === "true";

  const [posts, totalCount] = await Promise.all([
    db.lostFoundPost.findMany({
      where: { resolved },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { messages: true } } },
    }),
    db.lostFoundPost.count(),
  ]);

  const resolvedCount = await db.lostFoundPost.count({ where: { resolved: true } });

  return (
    <div className="p-6 max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title">Lost &amp; Found</h1>
        <p className="page-subtitle">Manage and moderate lost &amp; found posts.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="stat-icon bg-brand-100 text-brand-700">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-3">{totalCount}</p>
          <p className="text-sm text-gray-500 mt-0.5">Total Posts</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-amber-100 text-amber-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-3">{totalCount - resolvedCount}</p>
          <p className="text-sm text-gray-500 mt-0.5">Active</p>
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

      {/* Status tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        <a
          href="/admin/lost-found"
          className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors
            ${!resolved
              ? "border-brand-700 text-brand-700"
              : "border-transparent text-gray-500 hover:text-gray-700"}`}
        >
          Active
          <span className={`ml-2 inline-flex items-center justify-center min-w-[20px] h-5 rounded-full text-xs px-1.5 font-semibold
            ${!resolved ? "bg-brand-900 text-white" : "bg-gray-100 text-gray-600"}`}>
            {totalCount - resolvedCount}
          </span>
        </a>
        <a
          href="/admin/lost-found?resolved=true"
          className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors
            ${resolved
              ? "border-brand-700 text-brand-700"
              : "border-transparent text-gray-500 hover:text-gray-700"}`}
        >
          Resolved
          <span className={`ml-2 inline-flex items-center justify-center min-w-[20px] h-5 rounded-full text-xs px-1.5 font-semibold
            ${resolved ? "bg-brand-900 text-white" : "bg-gray-100 text-gray-600"}`}>
            {resolvedCount}
          </span>
        </a>
      </div>

      {posts.length === 0 ? (
        <div className="empty-state">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <p className="text-sm text-gray-500">No {resolved ? "resolved" : "active"} posts.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table-base">
            <thead>
              <tr>
                <th>Type</th>
                <th>Title</th>
                <th>Category</th>
                <th>Location</th>
                <th>Messages</th>
                <th>Posted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td>
                    <span className={`badge ${post.type === "lost" ? "badge-red" : "badge-green"}`}>
                      {post.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="max-w-[180px]">
                    <p className="font-medium text-gray-900 truncate">{post.title}</p>
                    <p className="text-xs text-gray-400 truncate">{post.description}</p>
                  </td>
                  <td className="text-gray-600">{post.category}</td>
                  <td className="text-gray-600 max-w-[120px] truncate">{post.location}</td>
                  <td>
                    <span className="badge badge-blue">{post._count.messages}</span>
                  </td>
                  <td className="text-gray-400 text-xs whitespace-nowrap">{timeAgo(post.createdAt)}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      {!post.resolved && <ResolveButton postId={post.id} />}
                      <DeletePostButton postId={post.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function DeletePostButton({ postId }: { postId: string }) {
  return (
    <form action={async () => {
      "use server";
      const { db: prisma } = await import("@/lib/db");
      const { revalidatePath } = await import("next/cache");
      await prisma.lostFoundPost.delete({ where: { id: postId } });
      revalidatePath("/admin/lost-found");
    }}>
      <button type="submit"
        className="btn btn-sm btn-danger">
        Delete
      </button>
    </form>
  );
}
