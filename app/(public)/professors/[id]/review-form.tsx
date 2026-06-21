"use client";

import { useState } from "react";

const RATING_FIELDS: { key: string; label: string; desc: string }[] = [
  { key: "ratingTeach",   label: "Teaching Quality",   desc: "How well did they explain concepts?" },
  { key: "ratingGrade",   label: "Grading Fairness",   desc: "Were grades fair and transparent?" },
  { key: "ratingLoad",    label: "Course Workload",     desc: "Was the workload manageable?" },
  { key: "ratingComm",    label: "Communication",       desc: "Were they approachable and responsive?" },
  { key: "ratingOverall", label: "Overall Rating",      desc: "Overall, how was your experience?" },
];

interface FormState {
  ratings:    Record<string, number>;
  courseCode: string;
  semester:   string;
  comment:    string;
}

const INITIAL: FormState = {
  ratings:    Object.fromEntries(RATING_FIELDS.map((f) => [f.key, 0])),
  courseCode: "",
  semester:   "",
  comment:    "",
};

function StarInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button type="button" key={n}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          className="focus:outline-none transition-transform hover:scale-110">
          <svg className={`w-8 h-8 transition-colors
            ${n <= (hover || value) ? "text-amber-400" : "text-gray-200 hover:text-amber-200"}`}
            fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
        </button>
      ))}
    </div>
  );
}

export default function ReviewForm({ professorId, professorName }: { professorId: string; professorName: string }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function updateRating(key: string, val: number) {
    setForm((f) => ({ ...f, ratings: { ...f.ratings, [key]: val } }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const unrated = RATING_FIELDS.filter((f) => !form.ratings[f.key]);
    if (unrated.length > 0) {
      setError(`Please rate: ${unrated.map((f) => f.label).join(", ")}`);
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          professorId,
          ...Object.fromEntries(RATING_FIELDS.map((f) => [f.key, form.ratings[f.key]])),
          courseCode: form.courseCode || undefined,
          semester:   form.semester   || undefined,
          comment:    form.comment    || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Submission failed. Please try again.");
      } else {
        setSuccess(true);
        setForm(INITIAL);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="card p-8 text-center border-green-200 bg-green-50">
        <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h3 className="font-bold text-green-800 text-lg">Review submitted!</h3>
        <p className="text-sm text-green-600 mt-2">Your review is pending moderation and will appear once approved.</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-100 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-brand-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"/>
            </svg>
          </div>
          <span className="font-semibold text-gray-900">Write a Review</span>
        </div>
        <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="px-6 pb-6 border-t border-gray-100 space-y-6 pt-6">
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700 flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
            </svg>
            Reviews are 100% anonymous and go through moderation before appearing.
          </div>

          {/* Star ratings */}
          <div className="space-y-5">
            {RATING_FIELDS.map((f) => (
              <div key={f.key} className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-800">{f.label}</label>
                  {form.ratings[f.key] > 0 && (
                    <span className="badge badge-amber">{form.ratings[f.key]}/5</span>
                  )}
                </div>
                <StarInput value={form.ratings[f.key]} onChange={(v) => updateRating(f.key, v)} />
                <p className="text-xs text-gray-400 mt-2">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Optional fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Course Code (optional)</label>
              <input type="text" value={form.courseCode} placeholder="e.g. CS-201"
                maxLength={20}
                onChange={(e) => setForm((f) => ({ ...f, courseCode: e.target.value }))}
                className="input w-full" />
            </div>
            <div>
              <label className="label">Semester (optional)</label>
              <input type="text" value={form.semester} placeholder="e.g. Fall 2024"
                maxLength={20}
                onChange={(e) => setForm((f) => ({ ...f, semester: e.target.value }))}
                className="input w-full" />
            </div>
          </div>

          <div>
            <label className="label">
              Comments (optional)
              <span className="text-gray-400 font-normal ml-1">· {form.comment.length}/1000</span>
            </label>
            <textarea value={form.comment} rows={4} maxLength={1000}
              placeholder="Share your experience with this professor…"
              onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
              className="input w-full resize-none" />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-start gap-2">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
              {error}
            </div>
          )}

          <button type="submit" disabled={submitting}
            className="btn btn-primary w-full py-3">
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Submitting…
              </span>
            ) : "Submit Review"}
          </button>
        </form>
      )}
    </div>
  );
}
