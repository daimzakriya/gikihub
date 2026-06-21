import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Campus Events — GIKI Plus" };
export const revalidate = 300;

const CATEGORY_COLORS: Record<string, string> = {
  Academic:    "badge-blue",
  Sports:      "badge-green",
  Cultural:    "bg-purple-100 text-purple-700",
  Workshop:    "badge-amber",
  Career:      "bg-cyan-100 text-cyan-700",
  Society:     "bg-pink-100 text-pink-700",
  Other:       "badge-gray",
};

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const sp       = await searchParams;
  const category = sp.category ?? "";

  const now = new Date();

  const [upcoming, past] = await Promise.all([
    db.campusEvent.findMany({
      where: {
        status: "APPROVED",
        date:   { gte: now },
        ...(category ? { category } : {}),
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    }),
    db.campusEvent.findMany({
      where: {
        status: "APPROVED",
        date:   { lt: now },
        ...(category ? { category } : {}),
      },
      orderBy: { date: "desc" },
      take: 20,
    }),
  ]);

  const categories = Object.keys(CATEGORY_COLORS);

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="page-title">Campus Events</h1>
        <p className="page-subtitle">Societies, workshops, sports, career fairs — all in one place.</p>
      </div>

      {/* Category filter pills */}
      <div className="flex gap-2 flex-wrap mb-8">
        <a href="/events"
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors
            ${!category ? "bg-brand-900 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
          All events
        </a>
        {categories.map((c) => (
          <a key={c} href={`/events?category=${c}`}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors
              ${category === c ? "bg-brand-900 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {c}
          </a>
        ))}
      </div>

      {/* Upcoming */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-lg font-bold text-gray-900">Upcoming</h2>
          <span className="badge badge-brand">{upcoming.length}</span>
        </div>

        {upcoming.length === 0 ? (
          <div className="empty-state">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/>
              </svg>
            </div>
            <h3 className="font-semibold text-gray-700">No upcoming events</h3>
            <p className="text-gray-400 text-sm mt-1">Check back soon — events will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcoming.map((event) => (
              <div key={event.id}
                className="card card-hover p-5">
                <div className="flex items-start gap-4 flex-wrap">
                  {/* Date block */}
                  <div className="bg-brand-900 text-white rounded-2xl p-3 text-center flex-shrink-0 w-16 shadow-sm">
                    <p className="text-xs font-semibold text-brand-300 uppercase tracking-wide">
                      {new Date(event.date).toLocaleString("en-US", { month: "short" })}
                    </p>
                    <p className="text-2xl font-black leading-none mt-0.5">
                      {new Date(event.date).getDate()}
                    </p>
                    <p className="text-xs text-brand-400 mt-0.5">
                      {new Date(event.date).toLocaleString("en-US", { weekday: "short" })}
                    </p>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <h3 className="font-bold text-gray-900 text-base">{event.title}</h3>
                      <span className={`badge ${CATEGORY_COLORS[event.category] ?? CATEGORY_COLORS.Other}`}>
                        {event.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">{event.description}</p>
                    <div className="flex gap-4 text-xs text-gray-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
                        </svg>
                        {event.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        {event.startTime}{event.endTime ? ` – ${event.endTime}` : ""}
                      </span>
                      {event.organizer && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
                          </svg>
                          {event.organizer}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Past events */}
      {past.length > 0 && (
        <section>
          <h2 className="text-base font-bold text-gray-400 mb-4">Past Events</h2>
          <div className="space-y-2">
            {past.map((event) => (
              <div key={event.id}
                className="bg-gray-50 border border-gray-100 rounded-xl p-4 opacity-60 hover:opacity-80 transition-opacity">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`badge ${CATEGORY_COLORS[event.category] ?? CATEGORY_COLORS.Other}`}>
                    {event.category}
                  </span>
                  <p className="font-medium text-gray-700 flex-1 text-sm">{event.title}</p>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5"/>
                    </svg>
                    {formatDate(event.date)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
