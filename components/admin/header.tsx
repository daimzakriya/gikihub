"use client";

import { useTransition } from "react";
import { logoutAction } from "@/app/auth/login/actions";
import { type Role, ROLE_LABELS, ROLE_COLORS } from "@/types";

interface HeaderProps {
  role: Role;
  userName: string | null;
  userEmail: string;
}

export function AdminHeader({ role, userName, userEmail }: HeaderProps) {
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(() => { logoutAction(); });
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200/80 flex items-center
                       justify-between px-6 flex-shrink-0 shadow-sm shadow-gray-100/50">
      {/* Breadcrumb / context */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <span className="font-semibold text-brand-700">GIKI Plus</span>
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
        </svg>
        <span>Admin</span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Role badge */}
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${ROLE_COLORS[role]}`}>
          {ROLE_LABELS[role]}
        </span>

        {/* Divider */}
        <div className="w-px h-5 bg-gray-200"/>

        {/* User */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-brand-100 border border-brand-200
                          flex items-center justify-center text-xs font-bold text-brand-700">
            {(userName ?? userEmail)[0].toUpperCase()}
          </div>
          <span className="text-sm font-medium text-gray-700 hidden sm:block">
            {userName ?? userEmail.split("@")[0]}
          </span>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          disabled={isPending}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-600
                     transition-colors disabled:opacity-50 px-2 py-1 rounded-lg hover:bg-red-50"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          <span className="hidden sm:block">{isPending ? "Signing out…" : "Sign out"}</span>
        </button>
      </div>
    </header>
  );
}
