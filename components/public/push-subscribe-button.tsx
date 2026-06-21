"use client";

import { useState, useEffect } from "react";

export default function PushSubscribeButton() {
  const [state, setState]     = useState<"loading" | "unsupported" | "subscribed" | "unsubscribed">("loading");
  const [pending, setPending] = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState("unsupported");
      return;
    }
    navigator.serviceWorker.ready.then(async (reg) => {
      const existing = await reg.pushManager.getSubscription();
      setState(existing ? "subscribed" : "unsubscribed");
    });
  }, []);

  async function subscribe() {
    setPending(true);
    setError("");
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });
      const json = sub.toJSON();
      const res  = await fetch("/api/push", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          endpoint:  json.endpoint,
          p256dhKey: (json.keys as Record<string, string>)?.p256dh,
          authKey:   (json.keys as Record<string, string>)?.auth,
        }),
      });
      if (!res.ok) throw new Error("Server rejected subscription");
      setState("subscribed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to subscribe");
    } finally {
      setPending(false);
    }
  }

  async function unsubscribe() {
    setPending(true);
    setError("");
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push", {
          method:  "DELETE",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setState("unsubscribed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unsubscribe");
    } finally {
      setPending(false);
    }
  }

  if (state === "loading")     return null;
  if (state === "unsupported") return null;

  return (
    <div className="flex flex-col items-center gap-2">
      {state === "unsubscribed" ? (
        <button onClick={subscribe} disabled={pending}
          className="inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white
                     font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
          </svg>
          {pending ? "Enabling…" : "Get exam notifications"}
        </button>
      ) : (
        <button onClick={unsubscribe} disabled={pending}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors disabled:opacity-50">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
          </svg>
          {pending ? "…" : "✓ Notifications on · Disable"}
        </button>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
