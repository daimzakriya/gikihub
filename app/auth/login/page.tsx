"use client";

import Image from "next/image";
import { useActionState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirectTo   = searchParams.get("redirect") ?? "/admin/dashboard";
  const errorParam   = searchParams.get("error");

  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  // Full-page navigate so all cookies (set by the Server Action) are sent with the request
  useEffect(() => {
    if (state.redirectTo) {
      window.location.replace(state.redirectTo);
    }
  }, [state.redirectTo]);

  // Map URL error codes to human-readable messages
  const urlError =
    errorParam === "account_inactive"
      ? "Your account has been deactivated."
      : errorParam === "insufficient_permissions"
      ? "You don't have permission to access that page."
      : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur mb-4">
            <Image src="/giki-logo.png" alt="GIKI" width={64} height={64} className="rounded-full" />
          </div>
          <h1 className="text-2xl font-bold text-white">GIKI Plus Admin</h1>
          <p className="text-brand-300 text-sm mt-1">Sign in to your admin account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* URL-based error banner */}
          {urlError && (
            <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {urlError}
            </div>
          )}

          <form action={formAction} className="space-y-5">
            {/* Hidden redirect field */}
            <input type="hidden" name="redirect" value={redirectTo} />

            {/* Generic form error */}
            {state.error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {state.error}
              </div>
            )}

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                           disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="you@example.com"
                disabled={isPending}
              />
              {state.fieldErrors?.email && (
                <p className="mt-1 text-xs text-red-600">
                  {state.fieldErrors.email[0]}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                           disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="••••••••"
                disabled={isPending}
              />
              {state.fieldErrors?.password && (
                <p className="mt-1 text-xs text-red-600">
                  {state.fieldErrors.password[0]}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-lg bg-brand-900 hover:bg-brand-800 active:bg-brand-900
                         text-white font-semibold py-2.5 text-sm
                         transition-colors duration-150
                         focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
                         disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? "Signing in…" : "Sign in"}
            </button>
          </form>

          {/* Rate limit note */}
          <p className="mt-5 text-center text-xs text-gray-400">
            5 failed attempts will lock you out for 15 minutes.
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-brand-400 mt-6">
          GIKI Plus · Admin Panel · Secure Access Only
        </p>
      </div>
    </div>
  );
}
