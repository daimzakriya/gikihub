import { type ClassValue, clsx } from "clsx";
import crypto from "crypto";

// ── Tailwind class merge ───────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  // Simple version without tailwind-merge to avoid extra dependency
  return inputs
    .flat()
    .filter(Boolean)
    .join(" ")
    .trim();
}

// ── IP hashing (for anonymous rate-limit keys, never store raw IPs) ──
export function hashIp(ip: string): string {
  return crypto
    .createHmac("sha256", process.env.NEXT_PUBLIC_APP_URL ?? "giki-plus-secret")
    .update(ip)
    .digest("hex")
    .slice(0, 32); // truncate — enough for uniqueness, less data stored
}

// ── Get real IP from Next.js request headers ──────────────────
export function getIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

// ── GIKI grade → GPA points ───────────────────────────────────
export const GRADE_POINTS: Record<string, number> = {
  A:   4.00,
  "A-": 3.67,
  "B+": 3.33,
  B:   3.00,
  "B-": 2.67,
  "C+": 2.33,
  C:   2.00,
  D:   1.00,
  F:   0.00,
  W:   -1,   // withdrawal — excluded from GPA calc
};

export const GRADE_OPTIONS = Object.keys(GRADE_POINTS).filter((g) => g !== "W");

export function calculateGPA(
  courses: { credits: number; grade: string }[]
): number {
  const valid = courses.filter(
    (c) => c.grade !== "W" && GRADE_POINTS[c.grade] !== undefined
  );
  const totalCredits = valid.reduce((s, c) => s + c.credits, 0);
  if (totalCredits === 0) return 0;
  const totalPoints = valid.reduce(
    (s, c) => s + c.credits * GRADE_POINTS[c.grade],
    0
  );
  return Math.round((totalPoints / totalCredits) * 100) / 100;
}

// ── Format bytes to human-readable size ──────────────────────
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// ── Truncate text ─────────────────────────────────────────────
export function truncate(text: string, length: number): string {
  return text.length > length ? text.slice(0, length) + "…" : text;
}

// ── Date formatting ───────────────────────────────────────────
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function timeAgo(date: Date | string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  const intervals: [number, string][] = [
    [31536000, "year"],
    [2592000, "month"],
    [86400, "day"],
    [3600, "hour"],
    [60, "minute"],
  ];
  for (const [secs, label] of intervals) {
    const n = Math.floor(seconds / secs);
    if (n >= 1) return `${n} ${label}${n > 1 ? "s" : ""} ago`;
  }
  return "just now";
}
