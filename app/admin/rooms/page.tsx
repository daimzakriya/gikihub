import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";
import UploadTimetableForm from "./upload-form";

export const metadata: Metadata = { title: "Rooms & Timetable — Admin" };

export default async function AdminRoomsPage() {
  const [roomCount, slotCount] = await Promise.all([
    db.room.count(),
    db.timetableSlot.count(),
  ]);

  const rooms = await db.room.findMany({
    orderBy: [{ block: "asc" }, { name: "asc" }],
    include: { _count: { select: { timetableSlots: true } } },
    take: 50,
  });

  const blockCount = [...new Set(rooms.map((r) => r.block))].length;

  return (
    <div className="p-6 max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="page-title">Rooms &amp; Timetable</h1>
        <p className="page-subtitle">Upload a CSV timetable to power the Room Finder feature.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="stat-icon bg-brand-100 text-brand-700">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-3">{roomCount}</p>
          <p className="text-sm text-gray-500 mt-0.5">Total Rooms</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-blue-100 text-blue-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-3">{slotCount}</p>
          <p className="text-sm text-gray-500 mt-0.5">Timetable Slots</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-purple-100 text-purple-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-3">{blockCount}</p>
          <p className="text-sm text-gray-500 mt-0.5">Blocks</p>
        </div>
      </div>

      {/* Upload form */}
      <UploadTimetableForm />

      {/* Room list */}
      {rooms.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Current Rooms</h2>
            <span className="badge badge-gray">{roomCount} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Room</th>
                  <th>Block</th>
                  <th>Type</th>
                  <th>Floor</th>
                  <th>Capacity</th>
                  <th>Slots</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room.id}>
                    <td className="font-medium text-gray-900">{room.name}</td>
                    <td>
                      <span className="badge badge-gray">{room.block}</span>
                    </td>
                    <td className="text-gray-600">{room.type}</td>
                    <td className="text-gray-600">{room.floor}</td>
                    <td className="text-gray-600">{room.capacity}</td>
                    <td>
                      <span className="badge badge-blue">
                        {room._count.timetableSlots} slots
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {roomCount > 50 && (
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-400">
                Showing 50 of {roomCount} rooms.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
