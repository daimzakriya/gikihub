"use client";

import { useState, useTransition } from "react";

export default function MarkResolvedButton({ feedbackId }: { feedbackId: string }) {
  const [done,       setDone]       = useState(false);
  const [isPending,  startTransition] = useTransition();

  function handle() {
    startTransition(async () => {
      const res = await fetch(`/api/admin/feedback/${feedbackId}/resolve`, { method: "PATCH" });
      if (res.ok) setDone(true);
    });
  }

  if (done) return <span className="text-xs font-semibold text-green-600">✓ Resolved</span>;

  return (
    <button onClick={handle} disabled={isPending}
      className="text-xs font-semibold text-green-600 hover:text-green-800 bg-green-50
                 border border-green-200 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
      {isPending ? "…" : "Mark Resolved"}
    </button>
  );
}
