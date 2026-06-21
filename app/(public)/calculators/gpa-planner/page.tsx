"use client";

import { useState } from "react";
import Link from "next/link";

const CALC_TABS = [
  { label: "SGPA",        href: "/calculators/gpa" },
  { label: "CGPA",        href: "/calculators/cgpa" },
  { label: "GPA Planner", href: "/calculators/gpa-planner" },
  { label: "Merit",       href: "/calculators/merit" },
];

interface PlanResult {
  requiredSGPA: number;
  feasible: boolean;
  semestersNeeded: number | null;
  message: string;
}

function computePlan(
  currentCGPA: number,
  creditsDone: number,
  targetCGPA: number,
  creditsPerSemester: number,
  semestersLeft: number
): PlanResult {
  const totalCreditsAvailable = creditsDone + creditsPerSemester * semestersLeft;
  const requiredTotalQP = targetCGPA * totalCreditsAvailable;
  const currentQP = currentCGPA * creditsDone;
  const neededQP = requiredTotalQP - currentQP;
  const requiredSGPA = neededQP / (creditsPerSemester * semestersLeft);

  if (requiredSGPA > 4.0) {
    const denom = creditsPerSemester * (4.0 - targetCGPA);
    const numer = targetCGPA * creditsDone - currentQP;
    const semNeeded = denom > 0 ? Math.ceil(numer / denom) : null;
    return {
      requiredSGPA,
      feasible: false,
      semestersNeeded: semNeeded,
      message:
        semNeeded !== null
          ? `Not achievable in ${semestersLeft} semester${semestersLeft !== 1 ? "s" : ""}. You would need ${semNeeded} more semester${semNeeded !== 1 ? "s" : ""} of straight A's.`
          : "Target CGPA is not achievable given your current standing.",
    };
  }

  return {
    requiredSGPA: Math.round(requiredSGPA * 100) / 100,
    feasible:      true,
    semestersNeeded: 1,
    message: `Achievable! Maintain at least ${Math.max(0, requiredSGPA).toFixed(2)} SGPA for the next ${semestersLeft} semester${semestersLeft !== 1 ? "s" : ""}.`,
  };
}

export default function GPAPlannerPage() {
  const [currentCGPA, setCurrentCGPA]         = useState<string>("2.8");
  const [creditsDone, setCreditsDone]          = useState<string>("60");
  const [targetCGPA, setTargetCGPA]            = useState<string>("3.0");
  const [creditsPerSem, setCreditsPerSem]      = useState<string>("18");
  const [semestersLeft, setSemestersLeft]      = useState<string>("4");
  const [result, setResult] = useState<PlanResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (isNaN(+currentCGPA) || +currentCGPA < 0 || +currentCGPA > 4) e.currentCGPA = "Must be 0 – 4.00";
    if (isNaN(+creditsDone) || +creditsDone < 0) e.creditsDone = "Must be ≥ 0";
    if (isNaN(+targetCGPA) || +targetCGPA <= +currentCGPA || +targetCGPA > 4) e.targetCGPA = "Must be > current CGPA and ≤ 4.00";
    if (isNaN(+creditsPerSem) || +creditsPerSem < 1) e.creditsPerSem = "Must be ≥ 1";
    if (isNaN(+semestersLeft) || +semestersLeft < 1) e.semestersLeft = "Must be ≥ 1";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function calculate() {
    if (!validate()) return;
    setResult(computePlan(+currentCGPA, +creditsDone, +targetCGPA, +creditsPerSem, +semestersLeft));
  }

  const Field = ({
    label, value, onChange, error, placeholder, min = "0", max = "4", step = "0.01",
  }: {
    label: string; value: string; onChange: (v: string) => void;
    error?: string; placeholder?: string; min?: string; max?: string; step?: string;
  }) => (
    <div>
      <label className="label">{label}</label>
      <input
        type="number" min={min} max={max} step={step}
        value={value}
        onChange={(e) => { onChange(e.target.value); setResult(null); setErrors({}); }}
        placeholder={placeholder}
        className={`input w-full ${error ? "border-red-400 bg-red-50 focus:ring-red-500" : ""}`}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );

  return (
    <main className="max-w-xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="page-title">GPA Planner</h1>
        <p className="page-subtitle">Find out what SGPA you need to hit your target CGPA.</p>
      </div>

      <div className="flex gap-1 mb-8 bg-gray-100 p-1 rounded-xl overflow-x-auto">
        {CALC_TABS.map((t) => (
          <Link key={t.href} href={t.href}
            className={`flex-1 text-center text-sm font-medium py-2 rounded-lg transition-colors whitespace-nowrap
              ${t.href === "/calculators/gpa-planner" ? "bg-white text-brand-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            {t.label}
          </Link>
        ))}
      </div>

      <div className="card p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Current CGPA" value={currentCGPA} onChange={setCurrentCGPA} error={errors.currentCGPA} placeholder="e.g. 2.80" />
          <Field label="Credits Done" value={creditsDone} onChange={setCreditsDone} error={errors.creditsDone} min="0" max="200" step="1" placeholder="e.g. 60" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Target CGPA" value={targetCGPA} onChange={setTargetCGPA} error={errors.targetCGPA} placeholder="e.g. 3.00" />
          <Field label="Credits/Semester" value={creditsPerSem} onChange={setCreditsPerSem} error={errors.creditsPerSem} min="1" max="30" step="1" placeholder="e.g. 18" />
        </div>
        <Field label="Semesters Remaining" value={semestersLeft} onChange={setSemestersLeft} error={errors.semestersLeft} min="1" max="20" step="1" placeholder="e.g. 4" />

        <button onClick={calculate}
          className="btn btn-primary w-full py-3 mt-2">
          Calculate Plan
        </button>
      </div>

      {result && (
        <div className={`mt-6 card p-6 ${result.feasible ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${result.feasible ? "bg-green-100" : "bg-red-100"}`}>
              {result.feasible ? (
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
                </svg>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Required SGPA per semester</p>
              <p className={`text-4xl font-black tabular-nums ${result.feasible ? "text-green-700" : "text-red-700"}`}>
                {result.requiredSGPA <= 0 ? "0.00" : result.requiredSGPA > 4 ? "4.00+" : result.requiredSGPA.toFixed(2)}
              </p>
            </div>
          </div>

          <p className={`text-sm font-medium ${result.feasible ? "text-green-700" : "text-red-700"} bg-white/60 rounded-xl px-4 py-3`}>
            {result.message}
          </p>

          {result.feasible && (
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="bg-white/70 rounded-xl p-3">
                <p className="text-xs text-gray-500">Current CGPA</p>
                <p className="font-black text-gray-900 text-lg tabular-nums">{currentCGPA}</p>
              </div>
              <div className="bg-white/70 rounded-xl p-3">
                <p className="text-xs text-gray-500">Target CGPA</p>
                <p className="font-black text-gray-900 text-lg tabular-nums">{targetCGPA}</p>
              </div>
              <div className="bg-white/70 rounded-xl p-3">
                <p className="text-xs text-gray-500">Need/Semester</p>
                <p className="font-black text-green-700 text-lg tabular-nums">{result.requiredSGPA.toFixed(2)}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
