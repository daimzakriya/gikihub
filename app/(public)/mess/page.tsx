import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mess Menu",
  description: "Current GIKI hostel mess menu.",
};

// Revalidate every 30 minutes — menu doesn't change mid-day
export const revalidate = 1800;

export default async function MessPage() {
  const current = await db.messMenu.findFirst({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero header */}
      <div className="bg-brand-900 text-white px-4 py-14">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-1.5-.75m16.5-4.5l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-1.5-.75"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold">Mess Menu</h1>
          <p className="text-brand-300 mt-2 text-sm">GIKI Hostel Mess · Current menu</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 -mt-4">
        {current ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Caption bar */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-50 border border-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{current.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Last updated {formatDate(current.createdAt)}
                  </p>
                </div>
              </div>
              <a
                href={current.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline flex items-center gap-1.5 text-sm flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                </svg>
                Download
              </a>
            </div>

            {/* Menu display */}
            <div className="p-4 bg-gray-50">
              {current.fileType === "image" ? (
                // Image: show inline, full width
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={current.fileUrl}
                  alt={current.label}
                  className="w-full rounded-xl object-contain shadow-sm"
                  loading="eager"
                />
              ) : (
                // PDF: embed in iframe with fallback link
                <>
                  <iframe
                    src={`${current.fileUrl}#toolbar=0&view=FitH`}
                    title={current.label}
                    className="w-full rounded-xl border border-gray-200 shadow-sm"
                    style={{ height: "calc(100vh - 280px)", minHeight: "500px" }}
                  />
                  <p className="text-center text-xs text-gray-400 mt-3">
                    Can&apos;t see the PDF?{" "}
                    <a
                      href={current.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-600 underline"
                    >
                      Open in new tab
                    </a>
                  </p>
                </>
              )}
            </div>
          </div>
        ) : (
          // No menu uploaded yet
          <div className="empty-state card">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-800">No menu uploaded yet</h2>
            <p className="text-gray-400 text-sm mt-2">
              Check back soon — the mess committee will upload the menu shortly.
            </p>
          </div>
        )}

        {/* Footer note */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Menu is updated by the GIKI Plus admin team. For errors or updates,
          contact the Student Affairs office.
        </p>
      </div>
    </main>
  );
}
