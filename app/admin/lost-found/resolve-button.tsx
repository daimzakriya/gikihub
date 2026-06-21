"use client";

import { useState, useTransition } from "react";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export default function ResolveButton({ postId }: { postId: string }) {
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleResolve() {
    startTransition(async () => {
      const res = await fetch(`/api/admin/lost-found/${postId}/resolve`, { method: "PATCH" });
      if (res.ok) setDone(true);
    });
  }

  if (done) {
    return <span className="text-xs font-medium text-green-600">✓ Resolved</span>;
  }

  return (
    <button onClick={handleResolve} disabled={isPending}
      className="text-xs text-green-600 hover:text-green-800 font-medium hover:underline disabled:opacity-50">
      {isPending ? "…" : "Resolve"}
    </button>
  );
}
