"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { GRADE_OPTIONS, GRADE_POINTS, calculateGPA } from "@/lib/utils";
import type { Course } from "@/types";

const STORAGE_KEY = "giki-gpa-courses";

const CALC_TABS = [
  { label: "SGPA",        href: "/calculators/gpa" },
  { label: "CGPA",        href: "/calculators/cgpa" },
  { label: "GPA Planner", href: "/calculators/gpa-planner" },
  { label: "Merit",       href: "/calculators/merit" },
];

function newCourse(): Course {
  return { id: crypto.randomUUID(), name: "", credits: 3, grade: "A" };
}

export default function GPACalculatorPage() {
  const [courses, setCourses] = useState<Course[]>([newCourse()]);
  const [gpa, setGpa] = useState<number>(0);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setCourses(JSON.parse(saved));
    } catch {}
  }, []);

  // Recalculate whenever courses change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
    setGpa(calculateGPA(courses));
  }, [courses]);

  const updateCourse = useCallback((id: string, field: keyof Course, value: string | number) => {
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  }, []);

  const addCourse = () => setCourses((prev) => [...prev, newCourse()]);

  const removeCourse = (id: string) =>
    setCourses((prev) => (prev.length > 1 ? prev.filter((c) => c.id !== id) : prev));

  const reset = () => {
    setCourses([newCourse()]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const totalCredits = courses.filter((c) => c.grade !== "W").reduce((s, c) => s + c.credits, 0);
  const isDeansHonors = gpa >= 3.50 && totalCredits >= 15 && !courses.some((c) => c.grade === "F");

  const gpaColor =
    gpa >= 3.5 ? "text-green-600" :
    gpa >= 3.0 ? "text-blue-600"  :
    gpa >= 2.0 ? "text-amber-600" :
    "text-red-600";

  const gpaBg =
    gpa >= 3.5 ? "bg-green-50 border-green-200" :
    gpa >= 3.0 ? "bg-blue-50 border-blue-100"   :
    gpa >= 2.0 ? "bg-amber-50 border-amber-100"  :
    gpa > 0    ? "bg-red-50 border-red-100"      :
    "bg-white border-gray-200";

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      {/* Page title */}
      <div className="mb-6">
        <h1 className="page-title">GPA Calculator</h1>
        <p className="page-subtitle">
          GIKI uses <strong>relative (curved) grading</strong>. Enter the letter grade you received. Data stays in your browser only.
        </p>
      </div>

      {/* Calculator sub-tabs */}
      <div className="flex gap-1 mb-8 bg-gray-100 p-1 rounded-xl overflow-x-auto">
        {CALC_TABS.map((t) => (
          <Link key={t.href} href={t.href}
            className={`flex-1 text-center text-sm font-medium py-2 rounded-lg transition-colors whitespace-nowrap
              ${t.href === "/calculators/gpa"
                ? "bg-white text-brand-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"}`}>
            {t.label}
          </Link>
        ))}
      </div>

      {/* GPA result card */}
      <div className={`rounded-2xl border p-8 mb-6 text-center transition-colors ${gpaBg}`}>
        <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Your SGPA</p>
        <p className={`text-7xl font-black tabular-nums ${gpaColor}`}>{gpa.toFixed(2)}</p>
        <p className="text-sm text-gray-400 mt-3">{totalCredits} credit hours · {courses.length} course{courses.length !== 1 ? "s" : ""}</p>
        {isDeansHonors && (
          <div className="mt-4 inline-flex items-center gap-2 bg-green-100 border border-green-200 text-green-700 text-xs font-semibold px-4 py-2 rounded-full">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            Dean&apos;s Honor List eligible (SGPA ≥ 3.50)
          </div>
        )}
        {gpa > 0 && gpa < 2.0 && (
          <div className="mt-4 inline-flex items-center gap-2 bg-red-100 border border-red-200 text-red-700 text-xs font-semibold px-4 py-2 rounded-full">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
            </svg>
            Academic probation risk (CGPA &lt; 2.00)
          </div>
        )}
      </div>

      {/* Course rows */}
      <div className="space-y-2 mb-4">
        {courses.map((course, i) => (
          <div key={course.id} className="card p-4 flex gap-3 items-center hover:shadow-sm transition-shadow">
            <span className="text-xs font-bold text-gray-300 w-5 flex-shrink-0 text-center">{i + 1}</span>

            {/* Course name */}
            <div className="flex-1 min-w-0">
              <input
                type="text"
                placeholder="Course name (optional)"
                value={course.name}
                onChange={(e) => updateCourse(course.id, "name", e.target.value)}
                className="w-full text-sm border-0 outline-none text-gray-700 placeholder-gray-300 bg-transparent focus:ring-0"
              />
            </div>

            {/* Credits */}
            <div className="flex-shrink-0">
              <label className="text-xs text-gray-400 block mb-1 text-center">Credits</label>
              <select
                value={course.credits}
                onChange={(e) => updateCourse(course.id, "credits", Number(e.target.value))}
                className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"
              >
                {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            {/* Grade */}
            <div className="flex-shrink-0">
              <label className="text-xs text-gray-400 block mb-1 text-center">Grade</label>
              <select
                value={course.grade}
                onChange={(e) => updateCourse(course.id, "grade", e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-500 font-semibold bg-white"
              >
                {GRADE_OPTIONS.map((g) => (
                  <option key={g} value={g}>{g} ({GRADE_POINTS[g].toFixed(2)})</option>
                ))}
                <option value="W">W (Withdrawal)</option>
              </select>
            </div>

            {/* Remove */}
            <button
              onClick={() => removeCourse(course.id)}
              className="text-gray-200 hover:text-red-400 transition-colors flex-shrink-0 p-1 rounded-lg hover:bg-red-50"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={addCourse}
          className="flex-1 border-2 border-dashed border-gray-200 hover:border-brand-400 text-gray-400
                     hover:text-brand-600 text-sm font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
          </svg>
          Add Course
        </button>
        <button onClick={reset}
          className="px-4 text-sm text-gray-400 hover:text-red-500 transition-colors font-medium">
          Reset
        </button>
      </div>

      {/* Grade reference */}
      <div className="mt-8 card p-5">
        <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"/>
          </svg>
          GIKI Grade → GPA Points
        </h3>
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
          {GRADE_OPTIONS.map((g) => (
            <div key={g} className="text-center bg-gray-50 hover:bg-brand-50 rounded-xl p-2.5 transition-colors cursor-default">
              <p className="font-black text-gray-900 text-sm">{g}</p>
              <p className="text-xs text-gray-500 mt-0.5">{GRADE_POINTS[g].toFixed(2)}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3 bg-gray-50 rounded-lg px-3 py-2">
          GIKI uses relative (curved) grading — grades depend on class performance, not fixed percentages.
        </p>
      </div>
    </main>
  );
}
