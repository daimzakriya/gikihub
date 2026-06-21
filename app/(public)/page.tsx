import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GIKI Plus — Everything GIK, in your pocket",
};

const FEATURES = [
  {
    href:  "/room-finder",
    icon:  "🏫",
    title: "Room Finder",
    desc:  "Find free lecture halls and labs right now. Filter by block, time, and type.",
    accent: "from-blue-500/10 to-blue-600/5",
    border: "border-blue-100",
    iconBg: "bg-blue-50",
  },
  {
    href:  "/calculators/gpa",
    icon:  "📊",
    title: "GPA Calculator",
    desc:  "Calculate your SGPA and CGPA using GIKI's relative grading scale. Stays in your browser.",
    accent: "from-purple-500/10 to-purple-600/5",
    border: "border-purple-100",
    iconBg: "bg-purple-50",
  },
  {
    href:  "/professors",
    icon:  "👨‍🏫",
    title: "Professor Reviews",
    desc:  "Anonymous ratings for GIKI faculty — teaching quality, grading fairness, workload.",
    accent: "from-amber-500/10 to-amber-600/5",
    border: "border-amber-100",
    iconBg: "bg-amber-50",
  },
  {
    href:  "/memories",
    icon:  "📍",
    title: "GIKI Yaadein",
    desc:  "Pin your campus memories to a map. Stories, milestones, funny moments.",
    accent: "from-pink-500/10 to-pink-600/5",
    border: "border-pink-100",
    iconBg: "bg-pink-50",
  },
  {
    href:  "/mess",
    icon:  "🍽️",
    title: "Mess Menu",
    desc:  "See the current hostel mess menu without walking all the way there.",
    accent: "from-green-500/10 to-green-600/5",
    border: "border-green-100",
    iconBg: "bg-green-50",
  },
  {
    href:  "/events",
    icon:  "📅",
    title: "Campus Events",
    desc:  "All GIKI events in one place — societies, workshops, sports, career fairs.",
    accent: "from-cyan-500/10 to-cyan-600/5",
    border: "border-cyan-100",
    iconBg: "bg-cyan-50",
  },
  {
    href:  "/lost-found",
    icon:  "🔍",
    title: "Lost & Found",
    desc:  "Lost your ID card? Found someone's keys? Post and recover items on campus.",
    accent: "from-orange-500/10 to-orange-600/5",
    border: "border-orange-100",
    iconBg: "bg-orange-50",
  },
  {
    href:  "/ai-chat",
    icon:  "🤖",
    title: "AI Assistant",
    desc:  "Ask anything about GIKI — grading, policies, buildings, deadlines, merit formula.",
    accent: "from-indigo-500/10 to-indigo-600/5",
    border: "border-indigo-100",
    iconBg: "bg-indigo-50",
  },
];

const STATS = [
  { value: "8+",   label: "Campus tools" },
  { value: "100%", label: "Free, always" },
  { value: "0",    label: "Data sold" },
];

export default function HomePage() {
  return (
    <main>
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 text-white">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none select-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full
                          bg-brand-700/30 blur-3xl"/>
          <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full
                          bg-accent-500/10 blur-3xl"/>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                          w-[600px] h-[600px] rounded-full bg-brand-800/20 blur-3xl"/>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 pt-20 pb-24 text-center">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15
                          rounded-full px-4 py-1.5 text-sm text-brand-200 mb-8 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-soft"/>
            Built for GIKI students
          </div>

          <h1 className="text-5xl sm:text-6xl font-black leading-[1.08] tracking-tight">
            Everything GIK,
            <br />
            <span className="text-gradient-gold">in your pocket.</span>
          </h1>

          <p className="mt-6 text-brand-300 text-lg sm:text-xl max-w-xl mx-auto leading-relaxed">
            Room finder, GPA calculator, professor reviews, campus memories,
            mess menu — all in one beautifully simple platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
            <Link
              href="/room-finder"
              className="btn-accent px-6 py-3 text-sm rounded-xl shadow-lg
                         shadow-accent-500/25 hover:shadow-accent-500/40 transition-shadow"
            >
              Find a free room →
            </Link>
            <Link
              href="/calculators/gpa"
              className="inline-flex items-center justify-center gap-2 bg-white/10
                         hover:bg-white/18 border border-white/20 text-white font-semibold
                         px-6 py-3 rounded-xl transition-all duration-150 text-sm backdrop-blur-sm"
            >
              Calculate my GPA
            </Link>
          </div>

          {/* Stats row */}
          <div className="flex justify-center gap-8 mt-14 pt-10 border-t border-white/10">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-black text-white">{s.value}</p>
                <p className="text-xs text-brand-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            What can GIKI Plus do?
          </h2>
          <p className="text-gray-500 mt-2 text-base max-w-md mx-auto">
            Every tool a GIKI student actually needs, in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className={`group block rounded-2xl border bg-gradient-to-br p-5
                          transition-all duration-200 hover:shadow-card-md hover:-translate-y-1
                          ${f.accent} ${f.border}`}
            >
              <div className={`w-11 h-11 rounded-xl ${f.iconBg} flex items-center justify-center
                              text-2xl mb-4 transition-transform duration-200 group-hover:scale-105`}>
                {f.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-1.5 group-hover:text-brand-700 transition-colors">
                {f.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-brand-600
                              opacity-0 group-hover:opacity-100 transition-opacity">
                Open
                <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5"
                     fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Privacy strip ─────────────────────────────────── */}
      <section className="border-t border-gray-100 bg-white py-10 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-brand-50 border border-brand-100
                            flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-brand-600" fill="none" viewBox="0 0 24 24"
                   stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-700">Your privacy matters</span>
          </div>
          <p className="text-sm text-gray-500">
            GPA calculator data never leaves your device — stored in your browser only.{" "}
            <Link href="/privacy" className="text-brand-600 hover:text-brand-800 font-medium
                                             underline underline-offset-2">
              Learn more
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
