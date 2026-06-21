import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MessMenuUploadForm } from "./upload-form";
import { deleteMessMenuAction } from "./actions";
import { formatDate, formatBytes } from "@/lib/utils";

export default async function AdminMessPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const menus = await db.messMenu.findMany({
    orderBy: { createdAt: "desc" },
  });

  const current = menus[0] ?? null;

  return (
    <div className="p-6 space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="page-title">Mess Menu</h1>
        <p className="page-subtitle">
          Upload the current mess menu image or PDF. Students see the latest one on the website.
        </p>
      </div>

      {/* Current menu preview */}
      {current && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Current Menu</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {current.label} · Uploaded {formatDate(current.createdAt)} · {formatBytes(current.fileSize)}
                </p>
              </div>
            </div>
            <a
              href={current.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-outline"
            >
              Open ↗
            </a>
          </div>

          {/* Preview */}
          <div className="p-4 bg-gray-50 flex justify-center">
            {current.fileType === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={current.fileUrl}
                alt={current.label}
                className="max-h-[500px] w-auto rounded-lg shadow object-contain"
              />
            ) : (
              <iframe
                src={current.fileUrl}
                title={current.label}
                className="w-full h-[500px] rounded-lg border border-gray-200"
              />
            )}
          </div>
        </div>
      )}

      {/* Upload form */}
      <MessMenuUploadForm />

      {/* History */}
      {menus.length > 1 && (
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-3">Previous Menus</h2>
          <div className="space-y-2">
            {menus.slice(1).map((m) => (
              <div
                key={m.id}
                className="card card-hover flex items-center gap-4 px-5 py-3.5"
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  m.fileType === "pdf" ? "bg-red-100" : "bg-blue-100"
                }`}>
                  <span className={`text-xs font-bold uppercase ${
                    m.fileType === "pdf" ? "text-red-600" : "text-blue-600"
                  }`}>
                    {m.fileType === "pdf" ? "PDF" : "IMG"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{m.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatDate(m.createdAt)} · {formatBytes(m.fileSize)}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <a
                    href={m.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-ghost text-brand-700"
                  >
                    View
                  </a>
                  <form action={deleteMessMenuAction}>
                    <input type="hidden" name="id"       value={m.id} />
                    <input type="hidden" name="fileName" value={m.fileName} />
                    <button
                      type="submit"
                      className="btn btn-sm btn-danger"
                      onClick={(e) => {
                        if (!confirm("Delete this menu? This cannot be undone.")) {
                          e.preventDefault();
                        }
                      }}
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

