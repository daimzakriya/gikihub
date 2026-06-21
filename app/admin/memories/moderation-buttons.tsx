"use client";

import { useState, useTransition } from "react";
import { moderateMemoryAction } from "./actions";

export default function MemoryModerationButtons({ memoryId }: { memoryId: string }) {
  const [done,       setDone]       = useState<"APPROVED" | "REJECTED" | null>(null);
  const [error,      setError]      = useState("");
  const [isPending,  startTransition] = useTransition();

  function handle(action: "APPROVED" | "REJECTED") {
    startTransition(async () => {
      const res = await moderateMemoryAction(memoryId, action);
      if (res.error) setError(res.error);
      else setDone(action);
    });
  }

  if (done) {
    return (
      <span className={`text-xs font-semibold px-3 py-1.5 rounded-full
        ${done === "APPROVED" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
        {done === "APPROVED" ? "✓ Approved" : "✗ Rejected"}
      </span>
    );
  }

  return (
    <div className="flex gap-2 flex-shrink-0">
      {error && <p className="text-xs text-red-500 self-center">{error}</p>}
      <button onClick={() => handle("APPROVED")} disabled={isPending}
        className="px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50">
        Approve
      </button>
      <button onClick={() => handle("REJECTED")} disabled={isPending}
        className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50">
        Reject
      </button>
    </div>
  );
}
