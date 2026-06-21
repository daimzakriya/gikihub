import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";
import EventForm from "./event-form";

export const metadata: Metadata = { title: "Events — Admin" };

export default async function AdminEventsPage() {
  const events = await db.campusEvent.findMany({
    orderBy: [{ date: "desc" }],
    take: 50,
  });

  const upcoming  = events.filter((e) => new Date(e.date) >= new Date()).length;
  const published = events.filter((e) => e.status === "APPROVED").length;

  return (
    <div className="p-6 max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="page-title">Campus Events</h1>
        <p className="page-subtitle">Manage and publish events for students.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="stat-icon bg-brand-100 text-brand-700">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-3">{events.length}</p>
          <p className="text-sm text-gray-500 mt-0.5">Total Events</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-blue-100 text-blue-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-3">{upcoming}</p>
          <p className="text-sm text-gray-500 mt-0.5">Upcoming</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-emerald-100 text-emerald-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-3">{published}</p>
          <p className="text-sm text-gray-500 mt-0.5">Published</p>
        </div>
      </div>

      {/* Event form */}
      <EventForm />

      {/* Events table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">All Events</h2>
          <span className="badge badge-gray">{events.length} total</span>
        </div>
        {events.length === 0 ? (
          <div className="empty-state">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <p className="text-sm text-gray-500">No events yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id}>
                    <td className="font-medium text-gray-900 max-w-[200px]">
                      <p className="truncate">{event.title}</p>
                    </td>
                    <td className="text-gray-600 whitespace-nowrap">{formatDate(event.date)}</td>
                    <td>
                      <span className="badge badge-blue">{event.category}</span>
                    </td>
                    <td>
                      <span className={`badge ${event.status === "APPROVED" ? "badge-green" : "badge-gray"}`}>
                        {event.status}
                      </span>
                    </td>
                    <td>
                      <DeleteEventButton eventId={event.id} />
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

function DeleteEventButton({ eventId }: { eventId: string }) {
  return (
    <form action={async () => {
      "use server";
      const { db: prisma } = await import("@/lib/db");
      const { revalidatePath } = await import("next/cache");
      await prisma.campusEvent.delete({ where: { id: eventId } });
      revalidatePath("/events");
      revalidatePath("/admin/events");
    }}>
      <button type="submit"
        className="btn btn-sm btn-danger">
        Delete
      </button>
    </form>
  );
}
