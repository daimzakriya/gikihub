"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type Role, type NavItem, ROLE_HIERARCHY } from "@/types";

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",      href: "/admin/dashboard",     icon: "LayoutDashboard", minRole: "STAFF"       },
  { label: "Exam Schedules", href: "/admin/exam-schedule", icon: "Calendar",        minRole: "ADMIN"       },
  { label: "Room Finder",    href: "/admin/rooms",         icon: "DoorOpen",        minRole: "ADMIN"       },
  { label: "Mess Menu",      href: "/admin/mess",          icon: "UtensilsCrossed", minRole: "STAFF"       },
  { label: "Events",         href: "/admin/events",        icon: "CalendarDays",    minRole: "MODERATOR"   },
  { label: "Professors",     href: "/admin/professors",    icon: "GraduationCap",   minRole: "MODERATOR"   },
  { label: "Memories",       href: "/admin/memories",      icon: "MapPin",          minRole: "MODERATOR"   },
  { label: "Lost & Found",   href: "/admin/lost-found",    icon: "Search",          minRole: "MODERATOR"   },
  { label: "Feedback",       href: "/admin/feedback",      icon: "MessageSquare",   minRole: "MODERATOR"   },
  { label: "Users",          href: "/admin/users",         icon: "Users",           minRole: "SUPER_ADMIN" },
];

const ICONS: Record<string, React.FC<{ className?: string }>> = {
  LayoutDashboard: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  ),
  Calendar: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <path d="M16 2v4M8 2v4M3 10h18"/>
    </svg>
  ),
  DoorOpen: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path d="M13 4H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9l-6-5Z"/>
      <path d="M13 4v5h5"/>
    </svg>
  ),
  UtensilsCrossed: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path d="M3 2v7c0 1.657 1.343 3 3 3h1v10M9 2v3m0 4v3M15 2l-1 9m0 0 4.5 11M14 11l4.5-9"/>
    </svg>
  ),
  CalendarDays: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <path d="M16 2v4M8 2v4M3 10h18"/>
      <circle cx="8" cy="15" r="1" fill="currentColor"/>
      <circle cx="12" cy="15" r="1" fill="currentColor"/>
      <circle cx="16" cy="15" r="1" fill="currentColor"/>
    </svg>
  ),
  GraduationCap: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path d="M22 10 12 4 2 10l10 6 10-6Z"/>
      <path d="M6 12v4c0 1.657 2.686 3 6 3s6-1.343 6-3v-4"/>
      <path d="M22 10v6"/>
    </svg>
  ),
  MapPin: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7Z"/>
      <circle cx="12" cy="9" r="2.5"/>
    </svg>
  ),
  Search: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
    </svg>
  ),
  MessageSquare: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  Users: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
};

// Group nav items for better visual hierarchy
const NAV_GROUPS = [
  { label: "Overview",  items: ["Dashboard"] },
  { label: "Content",   items: ["Mess Menu", "Events", "Professors", "Memories", "Lost & Found", "Feedback"] },
  { label: "Academic",  items: ["Exam Schedules", "Room Finder"] },
  { label: "System",    items: ["Users"] },
];

interface SidebarProps {
  role: Role;
  userName: string | null;
  userEmail: string;
}

export function AdminSidebar({ role, userName, userEmail }: SidebarProps) {
  const pathname = usePathname();

  const visibleItems = NAV_ITEMS.filter(
    (item) => ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[item.minRole]
  );
  const visibleLabels = new Set(visibleItems.map((i) => i.label));

  const isActive = (item: NavItem) =>
    item.href === "/admin/dashboard"
      ? pathname === item.href
      : pathname.startsWith(item.href);

  const initial = ((userName ?? userEmail) || "?")[0].toUpperCase();

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-brand-950 text-white flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-white/8 flex-shrink-0">
        <Image
          src="/giki-logo.png"
          alt="GIKI"
          width={42}
          height={42}
          className="rounded-full flex-shrink-0"
        />
        <div className="min-w-0">
          <p className="font-bold text-sm text-white leading-tight">GIKI Plus</p>
          <p className="text-brand-400 text-xs truncate">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-5">
        {NAV_GROUPS.map((group) => {
          const groupItems = visibleItems.filter((i) => group.items.includes(i.label));
          if (groupItems.length === 0) return null;

          return (
            <div key={group.label}>
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-brand-500">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {groupItems.map((item) => {
                  const active = isActive(item);
                  const Icon = ICONS[item.icon];
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                                  font-medium transition-all duration-150
                        ${active
                          ? "bg-brand-700 text-white shadow-sm"
                          : "text-brand-300 hover:bg-white/8 hover:text-white"}`}
                    >
                      {Icon && (
                        <Icon className={`w-4.5 h-4.5 flex-shrink-0 transition-colors
                          ${active ? "text-white" : "text-brand-400 group-hover:text-brand-200"}`}
                        />
                      )}
                      <span>{item.label}</span>
                      {item.badge != null && item.badge > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs font-bold
                                         rounded-full px-1.5 py-0.5 min-w-[20px] text-center leading-none">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* User info + account link */}
      <div className="px-3 py-4 border-t border-white/8 flex-shrink-0 space-y-1">
        <Link
          href="/admin/account"
          className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5
                      hover:bg-white/10 transition-colors
                      ${pathname === "/admin/account" ? "bg-white/10" : ""}`}
        >
          <div className="w-7 h-7 rounded-lg bg-brand-700 border border-brand-600
                          flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate leading-tight">
              {userName ?? userEmail.split("@")[0]}
            </p>
            <p className="text-[10px] text-brand-400 truncate mt-0.5">{role}</p>
          </div>
          <svg className="w-3.5 h-3.5 text-brand-500 group-hover:text-brand-300 flex-shrink-0"
               fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
          </svg>
        </Link>
      </div>
    </aside>
  );
}
