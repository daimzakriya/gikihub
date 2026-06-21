"use client";

import { useState, useEffect } from "react";
import { timeAgo } from "@/lib/utils";

interface Post {
  id:          string;
  type:        "lost" | "found";
  title:       string;
  description: string;
  category:    string;
  location:    string;
  imageUrl:    string | null;
  resolved:    boolean;
  createdAt:   string;
  contactToken:string;
}

const CATEGORIES = ["Electronics", "ID Card", "Books", "Keys", "Wallet", "Clothing", "Bag", "Other"];

const TYPE_STYLES = {
  lost:  { bg: "border-red-200",    badge: "badge-red",   label: "LOST"  },
  found: { bg: "border-green-200",  badge: "badge-green", label: "FOUND" },
};

export default function LostFoundPage() {
  const [posts,      setPosts]      = useState<Post[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [showMsg,    setShowMsg]    = useState<Post | null>(null);
  const [filter,     setFilter]     = useState<"all" | "lost" | "found">("all");
  const [hideResolved, setHideResolved] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/lost-found");
      const d   = await res.json();
      setPosts(d.posts ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = posts.filter((p) => {
    if (hideResolved && p.resolved) return false;
    if (filter !== "all" && p.type !== filter) return false;
    return true;
  });

  const lostCount  = posts.filter((p) => p.type === "lost"  && !p.resolved).length;
  const foundCount = posts.filter((p) => p.type === "found" && !p.resolved).length;

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="page-title">Lost &amp; Found</h1>
          <p className="page-subtitle">Post and recover lost items on campus.</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="btn btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
          </svg>
          Post Item
        </button>
      </div>

      {/* Stats row */}
      {!loading && posts.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="stat-card text-center">
            <p className="text-2xl font-black text-gray-900">{posts.filter((p) => !p.resolved).length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Active posts</p>
          </div>
          <div className="stat-card text-center">
            <p className="text-2xl font-black text-red-600">{lostCount}</p>
            <p className="text-xs text-gray-500 mt-0.5">Lost items</p>
          </div>
          <div className="stat-card text-center">
            <p className="text-2xl font-black text-green-600">{foundCount}</p>
            <p className="text-xs text-gray-500 mt-0.5">Found items</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap mb-6">
        {(["all", "lost", "found"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition-colors
              ${filter === f
                ? f === "lost" ? "bg-red-600 text-white"
                : f === "found" ? "bg-green-600 text-white"
                : "bg-brand-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {f === "all" ? `All (${posts.filter((p) => !p.resolved).length})` : f}
          </button>
        ))}
        <label className="flex items-center gap-2 ml-auto text-sm text-gray-600 cursor-pointer select-none">
          <div className={`relative w-9 h-5 rounded-full transition-colors ${hideResolved ? "bg-brand-600" : "bg-gray-200"}`}
            onClick={() => setHideResolved((v) => !v)}>
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${hideResolved ? "translate-x-4" : "translate-x-0.5"}`} />
          </div>
          Hide resolved
        </label>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-20">
          <div className="text-center">
            <svg className="animate-spin w-10 h-10 text-brand-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <p className="text-sm text-gray-400">Loading posts…</p>
          </div>
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="empty-state">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <h3 className="font-semibold text-gray-700">No posts found</h3>
          <p className="text-sm text-gray-400 mt-1">
            {filter !== "all" ? "Try a different filter." : "Be the first to post!"}
          </p>
          <button onClick={() => setShowForm(true)} className="btn btn-primary mt-4">Post an item</button>
        </div>
      )}

      {/* Posts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((post) => {
          const s = TYPE_STYLES[post.type];
          return (
            <div key={post.id}
              className={`card overflow-hidden ${s.bg} ${post.resolved ? "opacity-50" : ""}`}>
              {post.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.imageUrl} alt="" className="w-full h-40 object-cover" />
              )}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                  <span className={`badge ${s.badge} font-bold`}>{s.label}</span>
                  <span className="badge badge-gray">{post.category}</span>
                  {post.resolved && (
                    <span className="badge badge-gray">Resolved</span>
                  )}
                </div>
                <h3 className="font-bold text-gray-900 text-sm">{post.title}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{post.description}</p>
                <div className="flex items-center justify-between mt-3 gap-2">
                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
                    </svg>
                    {post.location}
                    <span className="mx-1">·</span>
                    {timeAgo(new Date(post.createdAt))}
                  </div>
                  {!post.resolved && (
                    <button onClick={() => setShowMsg(post)}
                      className="text-xs font-semibold text-brand-700 hover:text-brand-900 bg-brand-50 border border-brand-200
                                 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors">
                      Contact
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Post Form Modal */}
      {showForm && (
        <PostModal onClose={() => setShowForm(false)} onSuccess={() => { setShowForm(false); load(); }} />
      )}

      {/* Message Modal */}
      {showMsg && (
        <MessageModal post={showMsg} onClose={() => setShowMsg(null)} />
      )}
    </main>
  );
}

// ── Post Item Modal ─────────────────────────────────────────────────────────

function PostModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    type: "lost" as "lost" | "found",
    title: "", description: "", category: "Other", location: "",
  });
  const [image,      setImage]      = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      let imageUrl: string | undefined;
      if (image) {
        const fd = new FormData();
        fd.append("image", image);
        const ir = await fetch("/api/lost-found/upload", { method: "POST", body: fd });
        if (!ir.ok) throw new Error("Image upload failed");
        imageUrl = (await ir.json()).url;
      }
      const res = await fetch("/api/lost-found", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, imageUrl }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-gray-900 text-lg">Post an Item</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {(["lost", "found"] as const).map((t) => (
              <button key={t} type="button" onClick={() => setForm((f) => ({ ...f, type: t }))}
                className={`py-3 rounded-xl font-bold text-sm capitalize transition-colors
                  ${form.type === t
                    ? t === "lost" ? "bg-red-600 text-white shadow-sm" : "bg-green-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {t === "lost" ? "Lost item" : "Found item"}
              </button>
            ))}
          </div>
          <div>
            <label className="label">Item title *</label>
            <input type="text" required value={form.title} maxLength={100} placeholder="e.g. Blue water bottle"
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="input w-full" />
          </div>
          <div>
            <label className="label">Category</label>
            <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="input w-full">
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Location *</label>
            <input type="text" required value={form.location} placeholder="Where was it lost/found?"
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              className="input w-full" />
          </div>
          <div>
            <label className="label">Description *</label>
            <textarea required value={form.description} rows={3} maxLength={500}
              placeholder="Describe the item in detail…"
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="input w-full resize-none" />
          </div>
          <div>
            <label className="label">Photo (optional)</label>
            <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] ?? null)}
              className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg
                         file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100" />
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
          )}
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700">
            You will receive a private contact link after posting. No personal info is stored.
          </div>
          <button type="submit" disabled={submitting}
            className="btn btn-primary w-full py-3">
            {submitting ? "Posting…" : "Post Item"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Contact (Anonymous Message) Modal ──────────────────────────────────────

function MessageModal({ post, onClose }: { post: Post; onClose: () => void }) {
  const [message,    setMessage]    = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent,       setSent]       = useState(false);
  const [error,      setError]      = useState("");

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/lost-found/${post.id}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-gray-900">Anonymous Message</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4 bg-gray-50 rounded-xl px-4 py-3">
          Contacting poster of: <strong className="text-gray-800">{post.title}</strong>
          <br /><span className="text-xs text-gray-400 mt-0.5 block">Your message is fully anonymous.</span>
        </p>
        {sent ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <p className="font-bold text-gray-900">Message sent!</p>
            <p className="text-sm text-gray-500 mt-1">The poster will be able to reply.</p>
          </div>
        ) : (
          <form onSubmit={send} className="space-y-3">
            <textarea required value={message} rows={4} maxLength={500}
              placeholder="Describe your situation or ask a question…"
              onChange={(e) => setMessage(e.target.value)}
              className="input w-full resize-none" />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={submitting || !message.trim()}
              className="btn btn-primary w-full py-3">
              {submitting ? "Sending…" : "Send Message"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
