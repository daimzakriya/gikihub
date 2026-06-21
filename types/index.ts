// ─────────────────────────────────────────────────────────────
// GIKI Plus — Shared TypeScript Types
// ─────────────────────────────────────────────────────────────

// ── Roles ──────────────────────────────────────────────────────
export type Role = "SUPER_ADMIN" | "ADMIN" | "MODERATOR" | "STAFF";

export const ROLE_HIERARCHY: Record<Role, number> = {
  SUPER_ADMIN: 4,
  ADMIN:       3,
  MODERATOR:   2,
  STAFF:       1,
};

/** Returns true if `userRole` has at least the same level as `requiredRole` */
export function hasPermission(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/** Human-readable role labels */
export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN:       "Admin",
  MODERATOR:   "Moderator",
  STAFF:       "Staff",
};

/** Role badge colours (Tailwind classes) */
export const ROLE_COLORS: Record<Role, string> = {
  SUPER_ADMIN: "bg-purple-100 text-purple-800 border-purple-200",
  ADMIN:       "bg-blue-100 text-blue-800 border-blue-200",
  MODERATOR:   "bg-amber-100 text-amber-800 border-amber-200",
  STAFF:       "bg-gray-100 text-gray-700 border-gray-200",
};

// ── Profile ────────────────────────────────────────────────────
export interface Profile {
  id:        string;
  email:     string;
  name:      string | null;
  role:      Role;
  avatarUrl: string | null;
  isActive:  boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Admin Sidebar Nav ─────────────────────────────────────────
export interface NavItem {
  label:       string;
  href:        string;
  icon:        string;        // lucide icon name
  minRole:     Role;          // minimum role required to see this item
  badge?:      number;        // optional notification count
}

// ── API Responses ──────────────────────────────────────────────
export interface ApiSuccess<T = unknown> {
  success: true;
  data:    T;
}

export interface ApiError {
  success: false;
  error:   string;
  code?:   string;
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

// ── Review / Moderation Status ─────────────────────────────────
export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

// ── Exam Schedule ──────────────────────────────────────────────
export type ExamType = "MID" | "FINAL" | "QUIZ" | "OTHER";

export interface ExamSchedule {
  id:           string;
  title:        string;
  examType:     ExamType;
  semester:     string;
  fileUrl:      string;
  fileName:     string;
  fileSize:     number;
  notifiedAt:   string | null;
  uploadedById: string;
  createdAt:    string;
}

// ── Push Notification ──────────────────────────────────────────
export interface PushPayload {
  title:   string;
  body:    string;
  icon?:   string;
  badge?:  string;
  url?:    string;        // URL to open on notification click
  tag?:    string;        // replaces existing notification with same tag
}

// ── GPA Calculator ─────────────────────────────────────────────
export interface Course {
  id:      string;
  name:    string;
  credits: number;
  grade:   string;
}

export interface SemesterEntry {
  id:      string;
  label:   string;
  sgpa:    number;
  credits: number;
}
