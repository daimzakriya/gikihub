"use client";

import { useState } from "react";
import Link from "next/link";

const CALC_TABS = [
  { label: "SGPA",        href: "/calculators/gpa" },
  { label: "CGPA",        href: "/calculators/cgpa" },
  { label: "GPA Planner", href: "/calculators/gpa-planner" },
  { label: "Merit",       href: "/calculators/merit" },
];

// GIKI Admission Merit Formula:
// Matric (SSC): 10%
// Inter (FSc / A-Level): 40%
// ECAT:                  50%
const WEIGHTS = { matric: 0.10, fsc: 0.40, ecat: 0.50 } as const;

const FIELDS = [
  {
    key:         "matric" as const,
    label:       "Matric / SSC",
    hint:        "Out of 1100 marks",
    total:       1100,
    weight:      "10%",
    placeholder: "e.g. 980",
    icon: "M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25",
  },
  {
    key:         "fsc" as const,
    label:       "FSc / Pre-Engineering",
    hint:        "Out of 1100 marks",
    total:       1100,
    weight:      "40%",
    placeholder: "e.g. 1020",
    icon: "M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5",
  },
  {
    key:         "ecat" as const,
    label:       "ECAT Score",
    hint:        "Out of 400 marks",
    total:       400,
    weight:      "50%",
    placeholder: "e.g. 310",
    icon: "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z",
  },
];

export default function MeritCalculatorPage() {
  const [values, setValues] = useState({ matric: "", fsc: "", ecat: "" });
  const [errors, setErrors] = useState<Partial<Record<"matric" | "fsc" | "ecat", string>>>({});

  function validate(): boolean {
    const e: Partial<Record<"matric" | "fsc" | "ecat", string>> = {};
    for (const f of FIELDS) {
      const v = Number(values[f.key]);
      if (values[f.key] === "") { e[f.key] = "Required"; continue; }
      if (isNaN(v) || v < 0)    { e[f.key] = "Must be ≥ 0"; continue; }
      if (v > f.total)           { e[f.key] = `Max is ${f.total}`; }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const aggregate =
    Object.keys(errors).length === 0 && FIELDS.every((f) => values[f.key] !== "")
      ? FIELDS.reduce(
          (acc, f) => acc + (Number(values[f.key]) / f.total) * 100 * WEIGHTS[f.key],
          0
        )
      : null;

  const meritColor =
    aggregate === null      ? ""                :
    aggregate >= 75         ? "text-green-600"  :
    aggregate >= 60         ? "text-blue-600"   :
    aggregate >= 50         ? "text-amber-600"  :
    "text-red-600";

  return (
    <main className="max-w-xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="page-title">Merit Calculator</h1>
        <p className="page-subtitle">
          Calculate your GIKI admission aggregate using the official formula.
        </p>
      </div>

      <div className="flex gap-1 mb-8 bg-gray-100 p-1 rounded-xl overflow-x-auto">
        {CALC_TABS.map((t) => (
          <Link key={t.href} href={t.href}
            className={`flex-1 text-center text-sm font-medium py-2 rounded-lg transition-colors whitespace-nowrap
              ${t.href === "/calculators/merit" ? "bg-white text-brand-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            {t.label}
          </Link>
        ))}
      </div>

      {/* Formula card */}
      <div className="bg-brand-900 text-white rounded-2xl p-6 mb-6">
        <p className="text-xs font-semibold text-brand-300 mb-4 uppercase tracking-widest">GIKI Admission Formula</p>
        <div className="grid grid-cols-3 gap-3 text-center">
          {FIELDS.map((f) => (
            <div key={f.key} className="bg-white/10 rounded-xl p-4 border border-white/10">
              <p className="text-3xl font-black text-accent-400">{f.weight}</p>
              <p className="text-xs text-brand-200 mt-1.5 font-medium">{f.label}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-brand-400 mt-4 text-center">Matric (10%) + FSc (40%) + ECAT (50%) = 100%</p>
      </div>

      <div className="card p-6 space-y-5">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <div className="flex items-center justify-between mb-1.5">
              <label className="label flex items-center gap-2">
                <svg className="w-4 h-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={f.icon}/>
                </svg>
                {f.label}
                <span className="badge badge-brand ml-1">{f.weight}</span>
              </label>
              <span className="text-xs text-gray-400">{f.hint}</span>
            </div>
            <input
              type="number" min="0" max={f.total} step="1"
              value={values[f.key]}
              placeholder={f.placeholder}
              onChange={(e) => {
                setValues((v) => ({ ...v, [f.key]: e.target.value }));
                setErrors((err) => { const n = { ...err }; delete n[f.key]; return n; });
              }}
              className={`input w-full ${errors[f.key] ? "border-red-400 bg-red-50" : ""}`}
            />
            {errors[f.key] && <p className="mt-1 text-xs text-red-600">{errors[f.key]}</p>}
            {values[f.key] && !errors[f.key] && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-1.5 bg-brand-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (Number(values[f.key]) / f.total) * 100)}%` }} />
                </div>
                <p className="text-xs text-gray-400 flex-shrink-0">
                  Contributes <strong className="text-gray-600">{((Number(values[f.key]) / f.total) * 100 * WEIGHTS[f.key]).toFixed(2)}%</strong>
                </p>
              </div>
            )}
          </div>
        ))}

        <button onClick={validate}
          className="btn btn-primary w-full py-3">
          Calculate Merit
        </button>
      </div>

      {aggregate !== null && (
        <div className="mt-6 card p-6 text-center">
          <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Your Merit Aggregate</p>
          <p className={`text-7xl font-black tabular-nums ${meritColor}`}>{aggregate.toFixed(2)}%</p>

          <div className="mt-4 mb-4">
            {aggregate >= 75 ? (
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 border border-green-200 px-4 py-2 rounded-full text-sm font-semibold">
                Excellent — highly competitive for most GIKI programs
              </div>
            ) : aggregate >= 65 ? (
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 border border-blue-200 px-4 py-2 rounded-full text-sm font-semibold">
                Competitive — good chances for Engineering programs
              </div>
            ) : aggregate >= 55 ? (
              <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 border border-amber-200 px-4 py-2 rounded-full text-sm font-semibold">
                Borderline — depends on the specific program&apos;s cutoff
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 border border-red-200 px-4 py-2 rounded-full text-sm font-semibold">
                Below typical cutoffs — consider improving ECAT score
              </div>
            )}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
            {FIELDS.map((f) => (
              <div key={f.key} className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-400 font-medium">{f.label}</p>
                <p className="font-black text-gray-900 mt-1 text-base">
                  {((Number(values[f.key]) / f.total) * 100).toFixed(1)}%
                </p>
                <p className="text-brand-600 font-semibold">
                  → {((Number(values[f.key]) / f.total) * 100 * WEIGHTS[f.key]).toFixed(2)}%
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-center text-xs text-gray-400 mt-6">
        Formula source: GIKI Admissions. Verify current weights at{" "}
        <a href="https://giki.edu.pk" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">giki.edu.pk</a>.
      </p>
    </main>
  );
}
