"use client";

import { useActionState } from "react";
import { createEventAction } from "./actions";

const INIT = { error: "", success: false };
const CATEGORIES = ["Academic", "Sports", "Cultural", "Workshop", "Career", "Society", "Other"];

export default function EventForm() {
  const [state, formAction, pending] = useActionState(createEventAction, INIT);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <h2 className="font-semibold text-gray-900 mb-5">Create Event</h2>
      <form action={formAction} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1.5">Title *</label>
          <input type="text" name="title" required maxLength={200} placeholder="Event title"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1.5">Description</label>
          <textarea name="description" rows={3} maxLength={1000} placeholder="Event details…"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1.5">Date *</label>
            <input type="date" name="date" required
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1.5">Start Time *</label>
            <input type="time" name="startTime" required
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1.5">End Time</label>
            <input type="time" name="endTime"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1.5">Location *</label>
            <input type="text" name="location" required placeholder="e.g. Block-4 Auditorium"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1.5">Category</label>
            <select name="category"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1.5">Organizer</label>
            <input type="text" name="organizer" placeholder="e.g. CS Society"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
        </div>
        {state.error   && <p className="text-sm text-red-600">{state.error}</p>}
        {state.success && <p className="text-sm text-green-600">✓ Event created and published.</p>}
        <button type="submit" disabled={pending}
          className="bg-brand-900 hover:bg-brand-800 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">
          {pending ? "Creating…" : "Publish Event"}
        </button>
      </form>
    </div>
  );
}
