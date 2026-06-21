"use client";

import { useActionState } from "react";
import { addProfessorAction } from "./actions";

const INIT = { error: "", success: false };

const DEPTS = [
  "Computer Science", "Electrical", "Mechanical", "Civil", "Chemical",
  "Engineering Sciences", "Humanities", "Management Sciences",
];

export default function AddProfessorForm() {
  const [state, formAction, pending] = useActionState(addProfessorAction, INIT);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <h2 className="font-semibold text-gray-900 mb-4">Add Professor</h2>
      <form action={formAction} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1.5">Full Name *</label>
            <input type="text" name="name" required placeholder="Dr. Ahmed Khan"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1.5">Department *</label>
            <select name="department" required
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
              <option value="">Select department</option>
              {DEPTS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1.5">
            Courses (comma-separated, optional)
          </label>
          <input type="text" name="courses" placeholder="CS-201, CS-301, MT-101"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
        {state.error   && <p className="text-sm text-red-600">{state.error}</p>}
        {state.success && <p className="text-sm text-green-600">✓ Professor added successfully.</p>}
        <button type="submit" disabled={pending}
          className="bg-brand-900 hover:bg-brand-800 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">
          {pending ? "Adding…" : "Add Professor"}
        </button>
      </form>
    </div>
  );
}
