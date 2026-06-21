"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import type { SemesterEntry } from "@/types";

const STORAGE_KEY = "giki-cgpa-semesters";
const CALC_TABS = [
  { label: "SGPA",        href: "/calculators/gpa" },
  { label: "CGPA",        href: "/calculators/cgpa" },
  { label: "GPA Planner", href: "/calculators/gpa-planner" },
  { label: "Merit",       href: "/calculators/merit" },
];

function newSemester(n: number): SemesterEntry {
  return { id: crypto.randomUUID(), label: `Semester ${n}`, sgpa: 3.0, credits: 18 };
}

export default function CGPACalculatorPage() {
  const [semesters, setSemesters] = useState<SemesterEntry[]>([newSemester(1)]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setSemesters(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(semesters));
  }, [semesters]);

  const update = (id: string, field: keyof SemesterEntry, value: string | number) =>
    setSemesters((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));

  const add = () => setSemesters((prev) => [...prev, newSemester(prev.length + 1)]);
  const remove = (id: string) =>
    setSemesters((prev) => (prev.length > 1 ? prev.filter((s) => s.id !== id) : prev));

  // Running CGPA after each semester
  const running = semesters.reduce<{ cumQP: number; cumCr: number; cgpa: number[] }>(
    (acc, s) => {
      const cumQP = acc.cumQP + s.sgpa * s.credits;
      const cumCr = acc.cumCr + s.credits;
      return { cumQP, cumCr, cgpa: [...acc.cgpa, Math.round((cumQP / cumCr) * 100) / 100] };
    },
    { cumQP: 0, cumCr: 0, cgpa: [] }
  );

  const cgpa = running.cgpa[running.cgpa.length - 1] ?? 0;
  const totalCredits = semesters.reduce((s, sem) => s + sem.credits, 0);

  const chartData = semesters.map((s, i) => ({
    name:  s.label,
    SGPA:  s.sgpa,
    CGPA:  running.cgpa[i],
  }));

  const cgpaColor =
    cgpa >= 3.5  ? "text-green-600" :
    cgpa >= 3.0  ? "text-blue-600"  :
    cgpa >= 2.0  ? "text-amber-600" :
    "text-red-600";

  const cgpaBg =
    cgpa >= 3.5 ? "bg-green-50 border-green-200" :
    cgpa >= 3.0 ? "bg-blue-50 border-blue-100"   :
    cgpa >= 2.0 ? "bg-amber-50 border-amber-100"  :
    cgpa > 0    ? "bg-red-50 border-red-100"      :
    "bg-white border-gray-200";

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="page-title">CGPA Calculator</h1>
        <p className="page-subtitle">Track your cumulative GPA across all semesters.</p>
      </div>

      <div className="flex gap-1 mb-8 bg-gray-100 p-1 rounded-xl overflow-x-auto">
        {CALC_TABS.map((t) => (
          <Link key={t.href} href={t.href}
            className={`flex-1 text-center text-sm font-medium py-2 rounded-lg transition-colors whitespace-nowrap
              ${t.href === "/calculators/cgpa" ? "bg-white text-brand-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            {t.label}
          </Link>
        ))}
      </div>

      {/* CGPA result */}
      <div className={`rounded-2xl border p-8 mb-6 text-center transition-colors ${cgpaBg}`}>
        <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Your CGPA</p>
        <p className={`text-7xl font-black tabular-nums ${cgpaColor}`}>{cgpa.toFixed(2)}</p>
        <p className="text-sm text-gray-400 mt-3">
          {totalCredits} total credits · {semesters.length} semester{semesters.length !== 1 ? "s" : ""}
        </p>
        <div className="flex justify-center gap-3 mt-4 flex-wrap">
          {cgpa >= 3.5  && (
            <span className="badge badge-green text-xs px-3 py-1.5">Dean&apos;s Honor List</span>
          )}
          {cgpa >= 2.0 && cgpa < 3.5 && (
            <span className="badge badge-blue text-xs px-3 py-1.5">Good Standing</span>
          )}
          {cgpa > 0 && cgpa < 2.0  && (
            <span className="badge badge-red text-xs px-3 py-1.5">Academic Probation Risk</span>
          )}
        </div>
      </div>

      {/* Trend chart */}
      {semesters.length > 1 && (
        <div className="card p-5 mb-6">
          <h3 className="text-sm font-bold text-gray-700 mb-4">GPA Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 4]} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
              />
              <ReferenceLine y={3.5} stroke="#22c55e" strokeDasharray="4 4" label={{ value: "Dean's", fontSize: 10, fill: "#16a34a" }} />
              <ReferenceLine y={2.0} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "Min", fontSize: 10, fill: "#dc2626" }} />
              <Line type="monotone" dataKey="SGPA" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 4, fill: "#0ea5e9" }} name="SGPA" />
              <Line type="monotone" dataKey="CGPA" stroke="#14532d" strokeWidth={2.5} dot={{ r: 4, fill: "#14532d" }} name="CGPA" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Semester rows */}
      <div className="space-y-2 mb-4">
        {semesters.map((sem, i) => (
          <div key={sem.id} className="card p-4 flex gap-3 items-center hover:shadow-sm transition-shadow">
            <span className="text-xs font-bold text-gray-300 w-5 flex-shrink-0 text-center">{i + 1}</span>

            <input type="text" value={sem.label}
              onChange={(e) => update(sem.id, "label", e.target.value)}
              className="flex-1 text-sm border-0 outline-none text-gray-700 bg-transparent focus:ring-0 font-medium" />

            <div className="flex-shrink-0">
              <label className="text-xs text-gray-400 block mb-1 text-center">SGPA</label>
              <input type="number" min="0" max="4" step="0.01"
                value={sem.sgpa}
                onChange={(e) => update(sem.id, "sgpa", Math.min(4, Math.max(0, Number(e.target.value))))}
                className="w-20 text-sm border border-gray-200 rounded-lg px-2 py-1.5 text-center
                           focus:outline-none focus:ring-1 focus:ring-brand-500" />
            </div>

            <div className="flex-shrink-0">
              <label className="text-xs text-gray-400 block mb-1 text-center">Credits</label>
              <input type="number" min="1" max="30"
                value={sem.credits}
                onChange={(e) => update(sem.id, "credits", Math.max(1, Number(e.target.value)))}
                className="w-16 text-sm border border-gray-200 rounded-lg px-2 py-1.5 text-center
                           focus:outline-none focus:ring-1 focus:ring-brand-500" />
            </div>

            <div className="text-right flex-shrink-0 min-w-[4.5rem] bg-gray-50 rounded-xl px-3 py-2">
              <p className="text-xs text-gray-400">Running</p>
              <p className="font-black text-gray-800 text-sm tabular-nums">{(running.cgpa[i] ?? 0).toFixed(2)}</p>
            </div>

            <button onClick={() => remove(sem.id)} className="text-gray-200 hover:text-red-400 transition-colors flex-shrink-0 p-1 rounded-lg hover:bg-red-50">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        ))}
      </div>

      <button onClick={add}
        className="w-full border-2 border-dashed border-gray-200 hover:border-brand-400 text-gray-400
                   hover:text-brand-600 text-sm font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
        </svg>
        Add Semester
      </button>
    </main>
  );
}
