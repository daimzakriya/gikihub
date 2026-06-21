"use client";

import { useActionState, useRef, useState } from "react";
import { uploadTimetableAction, deleteTimetableAction } from "./actions";

const INITIAL_STATE = { error: "", success: false, count: 0 };

export default function UploadTimetableForm() {
  const [state, formAction, pending] = useActionState(
    uploadTimetableAction,
    INITIAL_STATE
  );
  const [deleting, setDeleting] = useState(false);
  const [fileName, setFileName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleDelete() {
    if (!confirm("This will delete all rooms and timetable data. Continue?")) return;
    setDeleting(true);
    await deleteTimetableAction();
    setDeleting(false);
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
      <div>
        <h2 className="font-semibold text-gray-900">Upload Timetable CSV</h2>
        <p className="text-xs text-gray-500 mt-1">
          Replaces existing data. Max 5 MB. Required columns:{" "}
          <code className="bg-gray-100 px-1 rounded text-xs">roomname, block, day, starttime, endtime, coursecode, coursename</code>
        </p>
      </div>

      {/* CSV format guide */}
      <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-600 font-mono overflow-x-auto">
        <p className="font-semibold text-gray-700 mb-2 font-sans">Example CSV:</p>
        <p>roomname,block,type,capacity,floor,day,starttime,endtime,coursecode,coursename,section,teachername</p>
        <p className="text-gray-400">LH-1,Block-4,Lecture Hall,120,0,Monday,08:00,09:30,CS-101,Programming Fundamentals,CS-A,Dr. Ahmed</p>
        <p className="text-gray-400">LH-1,Block-4,Lecture Hall,120,0,Tuesday,10:00,11:30,MT-101,Calculus-I,MT-A,Dr. Khan</p>
      </div>

      <form action={formAction} className="space-y-4">
        {/* Drop zone */}
        <div
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
            ${fileName ? "border-brand-400 bg-brand-50" : "border-gray-300 hover:border-brand-300"}`}>
          <svg className="w-8 h-8 mx-auto mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
          </svg>
          {fileName ? (
            <p className="text-sm font-medium text-brand-700">{fileName}</p>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-700">Click to select CSV file</p>
              <p className="text-xs text-gray-400 mt-1">or drag and drop here</p>
            </>
          )}
          <input ref={inputRef} type="file" name="file" accept=".csv" className="hidden"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")} />
        </div>

        {state.error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            {state.error}
          </div>
        )}

        {state.success && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">
            ✓ Uploaded {state.count} timetable slots successfully.
          </div>
        )}

        <div className="flex gap-3">
          <button type="submit" disabled={pending || !fileName}
            className="flex-1 bg-brand-900 hover:bg-brand-800 disabled:opacity-50 disabled:cursor-not-allowed
                       text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
            {pending ? "Uploading…" : "Upload & Replace Timetable"}
          </button>

          <button type="button" onClick={handleDelete} disabled={deleting}
            className="px-4 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-sm
                       font-medium transition-colors disabled:opacity-50">
            {deleting ? "Deleting…" : "Clear All"}
          </button>
        </div>
      </form>
    </div>
  );
}
