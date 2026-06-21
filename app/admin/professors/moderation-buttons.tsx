"use client";

import { useState } from "react";
import { moderateReviewAction } from "./actions";

export default function ModerationButtons({ reviewId }: { reviewId: string }) {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [done,    setDone]    = useState<"approve" | "reject" | null>(null);
  const [error,   setError]   = useState("");

  async function handle(action: "approve" | "reject") {
    setLoading(action);
    setError("");
    const res = await moderateReviewAction(reviewId, action);
    if (res.error) { setError(res.error); setLoading(null); }
    else setDone(action);
  }

  if (done) {
    return (
      <span className={`text-xs font-semibold px-3 py-1.5 rounded-full
        ${done === "approve" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
        {done === "approve" ? "✓ Approved" : "✗ Rejected"}
      </span>
    );
  }

  return (
    <div className="flex gap-2 flex-shrink-0">
      {error && <p className="text-xs text-red-500 self-center">{error}</p>}
      <button onClick={() => handle("approve")} disabled={!!loading}
        className="px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 text-xs font-semibold
                   rounded-lg transition-colors disabled:opacity-50">
        {loading === "approve" ? "…" : "Approve"}
      </button>
      <button onClick={() => handle("reject")} disabled={!!loading}
        className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold
                   rounded-lg transition-colors disabled:opacity-50">
        {loading === "reject" ? "…" : "Reject"}
      </button>
    </div>
  );
}
