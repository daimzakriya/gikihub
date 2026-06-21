"use client";

import { useState } from "react";

const CATEGORIES = ["General", "Bug Report", "Feature Request", "Content Issue", "Other"];

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "", email: "", subject: "", category: "General", message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [error,      setError]      = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <main className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Message sent!</h1>
        <p className="text-gray-500 mt-2 text-sm">
          Thanks for reaching out. We&apos;ll get back to you if a response is needed.
        </p>
        <button onClick={() => { setSuccess(false); setForm({ name: "", email: "", subject: "", category: "General", message: "" }); }}
          className="btn btn-outline mt-6">
          Send another message
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="page-title">Contact Us</h1>
        <p className="page-subtitle">
          Have a question, found a bug, or want to suggest something? We&apos;d love to hear from you.
        </p>
      </div>

      {/* Quick option cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        {[
          { icon: "M12 12.75c1.148 0 2.278.08 3.383.237 1.037.146 1.866.966 1.866 2.013 0 3.728-2.35 6.75-5.25 6.75S6.75 18.728 6.75 15c0-1.046.83-1.867 1.866-2.013A24.204 24.204 0 0112 12.75zm0 0c2.883 0 5.647.508 8.207 1.44a23.91 23.91 0 01-1.152 6.06M12 12.75c-2.883 0-5.647.508-8.208 1.44.125 2.104.52 4.136 1.153 6.06M12 12.75a2.25 2.25 0 002.248-2.354M12 12.75a2.25 2.25 0 01-2.248-2.354M12 8.25c.995 0 1.971-.08 2.922-.236.403-.066.74-.358.795-.762a3.778 3.778 0 00-.399-2.25M12 8.25c-.995 0-1.97-.08-2.922-.236-.402-.066-.74-.358-.795-.762a3.734 3.734 0 01.4-2.253M12 8.25a2.25 2.25 0 00-2.248 2.146M12 8.25a2.25 2.25 0 012.248 2.146",   title: "Bug Report",    desc: "Something broken?" },
          { icon: "M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18", title: "Feature Idea",   desc: "Suggest improvements" },
          { icon: "M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75",                                     title: "General",       desc: "Anything else" },
        ].map((c) => (
          <div key={c.title} className="card p-4 text-center hover:border-brand-200 transition-colors">
            <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center mx-auto mb-2.5">
              <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={c.icon}/>
              </svg>
            </div>
            <p className="font-semibold text-gray-900 text-sm">{c.title}</p>
            <p className="text-xs text-gray-500 mt-0.5">{c.desc}</p>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Name *</label>
              <input type="text" required value={form.name} maxLength={100}
                placeholder="Your name"
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="input w-full" />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" value={form.email} maxLength={200}
                placeholder="Optional — for a reply"
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="input w-full" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="input w-full">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Subject *</label>
              <input type="text" required value={form.subject} maxLength={200}
                placeholder="Brief subject line"
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                className="input w-full" />
            </div>
          </div>
          <div>
            <label className="label">
              Message *
              <span className="text-gray-400 font-normal ml-1">· {form.message.length}/2000</span>
            </label>
            <textarea required value={form.message} rows={5} maxLength={2000}
              placeholder="Describe your issue or suggestion in detail…"
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              className="input w-full resize-none" />
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
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
                Sending…
              </span>
            ) : "Send Message"}
          </button>
        </form>
      </div>
    </main>
  );
}
