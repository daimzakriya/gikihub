"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";

// Leaflet must not be SSR'd — coordinates and DOM are browser-only
const MapComponent = dynamic(() => import("./map-component"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[60vh] bg-gray-100 rounded-2xl flex items-center justify-center">
      <div className="text-center">
        <svg className="animate-spin w-8 h-8 text-brand-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        <p className="text-sm text-gray-500">Loading map…</p>
      </div>
    </div>
  ),
});

export interface Memory {
  id:           string;
  locationName: string;
  lat:          number;
  lng:          number;
  message:      string;
  type:         "STORY" | "MILESTONE" | "FUNNY" | "PHOTO";
  imageUrl:     string | null;
  likes:        number;
  createdAt:    string;
}

const TYPE_COLORS: Record<Memory["type"], string> = {
  STORY:     "badge-blue",
  MILESTONE: "badge-green",
  FUNNY:     "badge-amber",
  PHOTO:     "bg-pink-100 text-pink-700",
};

const TYPE_EMOJI: Record<Memory["type"], string> = {
  STORY: "📖", MILESTONE: "🏆", FUNNY: "😂", PHOTO: "📸",
};

export default function MemoriesPage() {
  const [memories, setMemories]     = useState<Memory[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [selected, setSelected]     = useState<Memory | null>(null);
  const [filterType, setFilterType] = useState<Memory["type"] | "">("");
  const [pinCoords, setPinCoords]   = useState<{ lat: number; lng: number } | null>(null);

  async function loadMemories() {
    setLoading(true);
    try {
      const res = await fetch("/api/memories");
      const data = await res.json();
      setMemories(data.memories ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadMemories(); }, []);

  const filtered = filterType ? memories.filter((m) => m.type === filterType) : memories;

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="page-title">GIKI Yaadein</h1>
          <p className="page-subtitle">Pin your campus memories to the map.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
          </svg>
          Add a Memory
        </button>
      </div>

      {/* Type filter pills */}
      <div className="flex gap-2 mb-5 flex-wrap">
        <button onClick={() => setFilterType("")}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors
            ${!filterType ? "bg-brand-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
          All ({memories.length})
        </button>
        {(["STORY", "MILESTONE", "FUNNY", "PHOTO"] as const).map((t) => (
          <button key={t} onClick={() => setFilterType(filterType === t ? "" : t)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors
              ${filterType === t ? "bg-brand-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {TYPE_EMOJI[t]} {t}
          </button>
        ))}
      </div>

      {/* Map — isolate creates a new stacking context so Leaflet's z-indices (up to ~1000)
           stay scoped inside here, letting z-50 modals render on top */}
      <div className="rounded-2xl overflow-hidden border border-gray-200 mb-8 shadow-sm isolate">
        <MapComponent
          memories={filtered}
          onMarkerClick={setSelected}
          onMapClick={(lat, lng) => {
            setPinCoords({ lat, lng });
            setShowForm(true);
          }}
        />
      </div>

      {/* Selected memory detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className={`badge ${TYPE_COLORS[selected.type]} mb-2 inline-flex`}>
                  {TYPE_EMOJI[selected.type]} {selected.type}
                </span>
                <h3 className="font-bold text-gray-900 text-base mt-1">{selected.locationName}</h3>
              </div>
              <button onClick={() => setSelected(null)}
                className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            {selected.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={selected.imageUrl} alt="" className="w-full rounded-xl mb-4 max-h-48 object-cover" />
            )}
            <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 rounded-xl px-4 py-3">{selected.message}</p>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-3">
              <svg className="w-3.5 h-3.5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-2.09C4.508 12.683 3 10.75 3 8.5a5.5 5.5 0 0110.234-2.764 5.5 5.5 0 018.766 4.764c0 2.25-1.508 4.183-2.885 5.63a22.049 22.049 0 01-3.744 2.772l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z"/>
              </svg>
              {selected.likes} likes
            </div>
          </div>
        </div>
      )}

      {/* Add Memory modal */}
      {showForm && (
        <AddMemoryModal
          initialCoords={pinCoords}
          onClose={() => { setShowForm(false); setPinCoords(null); }}
          onSuccess={() => { setShowForm(false); setPinCoords(null); loadMemories(); }}
        />
      )}

      {/* Memory cards */}
      <h2 className="text-base font-bold text-gray-900 mb-4">
        Memories
        <span className="badge badge-gray ml-2">{filtered.length}</span>
      </h2>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map((i) => (
            <div key={i} className="bg-gray-100 rounded-2xl h-36 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
            </svg>
          </div>
          <h3 className="font-semibold text-gray-700">No memories yet</h3>
          <p className="text-sm text-gray-400 mt-1">Be the first to add one!</p>
          <button onClick={() => setShowForm(true)} className="btn btn-primary mt-4">Add a Memory</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m) => (
            <div key={m.id}
              onClick={() => setSelected(m)}
              className="card card-interactive cursor-pointer">
              {m.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.imageUrl} alt="" className="w-full h-32 object-cover rounded-xl mb-3" />
              )}
              <div className="flex items-center gap-2 mb-2">
                <span className={`badge ${TYPE_COLORS[m.type]}`}>
                  {TYPE_EMOJI[m.type]} {m.type}
                </span>
              </div>
              <p className="font-semibold text-gray-900 text-sm">{m.locationName}</p>
              <p className="text-gray-500 text-xs mt-1 line-clamp-2">{m.message}</p>
              <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                <svg className="w-3.5 h-3.5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-2.09C4.508 12.683 3 10.75 3 8.5a5.5 5.5 0 0110.234-2.764 5.5 5.5 0 018.766 4.764c0 2.25-1.508 4.183-2.885 5.63a22.049 22.049 0 01-3.744 2.772l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z"/>
                </svg>
                {m.likes}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

// ── Add Memory Modal ────────────────────────────────────────────────────────

function AddMemoryModal({
  initialCoords,
  onClose,
  onSuccess,
}: {
  initialCoords: { lat: number; lng: number } | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    locationName: "",
    lat:          initialCoords?.lat.toFixed(5) ?? "34.07250",
    lng:          initialCoords?.lng.toFixed(5) ?? "72.64450",
    message:      "",
    type:         "STORY" as Memory["type"],
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
        const ir = await fetch("/api/memories", { method: "PUT", body: fd });
        if (!ir.ok) throw new Error("Image upload failed");
        const id = await ir.json();
        imageUrl = id.url;
      }
      const res = await fetch("/api/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, lat: +form.lat, lng: +form.lng, imageUrl }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(typeof d.error === "string" ? d.error : "Submission failed");
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-gray-900 text-lg">Add a Memory</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Location name *</label>
            <input type="text" value={form.locationName} required maxLength={100}
              placeholder="e.g. Engineering Block Rooftop"
              onChange={(e) => setForm((f) => ({ ...f, locationName: e.target.value }))}
              className="input w-full" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Latitude</label>
              <input type="number" value={form.lat} step="0.00001"
                onChange={(e) => setForm((f) => ({ ...f, lat: e.target.value }))}
                className="input w-full" />
            </div>
            <div>
              <label className="label">Longitude</label>
              <input type="number" value={form.lng} step="0.00001"
                onChange={(e) => setForm((f) => ({ ...f, lng: e.target.value }))}
                className="input w-full" />
            </div>
          </div>
          <div>
            <label className="label">Memory type</label>
            <div className="grid grid-cols-2 gap-2">
              {(["STORY", "MILESTONE", "FUNNY", "PHOTO"] as const).map((t) => (
                <button key={t} type="button"
                  onClick={() => setForm((f) => ({ ...f, type: t }))}
                  className={`py-2.5 rounded-xl text-sm font-semibold transition-colors
                    ${form.type === t ? "bg-brand-900 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  {TYPE_EMOJI[t]} {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">
              Your memory *
              <span className="text-gray-400 font-normal ml-1">· {form.message.length}/500</span>
            </label>
            <textarea value={form.message} rows={3} required maxLength={500}
              placeholder="Share the memory…"
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              className="input w-full resize-none" />
          </div>
          <div>
            <label className="label">Photo (optional, max 5 MB)</label>
            <input type="file" accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] ?? null)}
              className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg
                         file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100" />
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
          )}
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700">
            Memories are anonymous and go through moderation before appearing on the map.
          </div>
          <button type="submit" disabled={submitting}
            className="btn btn-primary w-full py-3">
            {submitting ? "Submitting…" : "Submit Memory"}
          </button>
        </form>
      </div>
    </div>
  );
}
