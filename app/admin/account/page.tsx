"use client";

import { useActionState } from "react";
import { changePasswordAction, type ChangePasswordState } from "./actions";

const initialState: ChangePasswordState = {};

export default function AccountPage() {
  const [state, formAction, isPending] = useActionState(changePasswordAction, initialState);

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Change your admin account password.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-5">Change Password</h2>

        {state.success && (
          <div className="mb-5 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            Password updated successfully.
          </div>
        )}

        {state.error && (
          <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
              Current password
            </label>
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              required
              disabled={isPending}
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                         disabled:opacity-50"
            />
            {state.fieldErrors?.currentPassword && (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors.currentPassword[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
              New password
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              required
              disabled={isPending}
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                         disabled:opacity-50"
            />
            {state.fieldErrors?.newPassword && (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors.newPassword[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
              Confirm new password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              disabled={isPending}
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                         disabled:opacity-50"
            />
            {state.fieldErrors?.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors.confirmPassword[0]}</p>
            )}
          </div>

          <div className="pt-1">
            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-lg bg-brand-900 hover:bg-brand-800 text-white
                         font-semibold py-2.5 text-sm transition-colors
                         focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
                         disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? "Updating…" : "Update password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
