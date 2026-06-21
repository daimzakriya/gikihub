import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { updateRoleAction, toggleActiveAction } from "./actions";
import { formatDate } from "@/lib/utils";
import { ROLE_LABELS, ROLE_COLORS, type Role } from "@/types";

export default async function UsersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Only SUPER_ADMIN can access this page (middleware also enforces this)
  const currentProfile = await db.profile.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  if (!currentProfile || currentProfile.role !== "SUPER_ADMIN") {
    redirect("/admin/dashboard?error=insufficient_permissions");
  }

  const users = await db.profile.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="page-title">User Management</h1>
        <p className="page-subtitle">
          Manage admin accounts and their roles. Only Super Admins can access this page.
        </p>
      </div>

      {/* Role legend */}
      <div className="card p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Role Hierarchy</p>
        <div className="flex flex-wrap gap-2 items-center">
          {(["SUPER_ADMIN", "ADMIN", "MODERATOR", "STAFF"] as Role[]).map((role) => (
            <span
              key={role}
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${ROLE_COLORS[role]}`}
            >
              {ROLE_LABELS[role]}
            </span>
          ))}
          <span className="text-xs text-gray-400 ml-1">â€” descending access level</span>
        </div>
      </div>

      {/* Users count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-gray-900">{users.length}</span> admin accounts
        </p>
        <p className="text-xs text-gray-400">
          To add a new admin: create in Supabase Auth, then assign role here.
        </p>
      </div>

      {/* Users table */}
      <div className="table-container">
        <table className="table-base">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isSelf = u.id === user.id;
              return (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-brand-700">
                          {(u.name ?? u.email ?? "?")[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {u.name ?? "â€”"}
                          {isSelf && (
                            <span className="ml-2 text-xs text-gray-400 font-normal">(you)</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Role change */}
                  <td>
                    {isSelf ? (
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${ROLE_COLORS[u.role as Role]}`}>
                        {ROLE_LABELS[u.role as Role]}
                      </span>
                    ) : (
                      <form action={updateRoleAction} className="flex items-center gap-2">
                        <input type="hidden" name="userId" value={u.id} />
                        <select
                          name="role"
                          defaultValue={u.role}
                          className="input py-1.5 text-xs"
                        >
                          <option value="SUPER_ADMIN">Super Admin</option>
                          <option value="ADMIN">Admin</option>
                          <option value="MODERATOR">Moderator</option>
                          <option value="STAFF">Staff</option>
                        </select>
                        <button
                          type="submit"
                          className="btn btn-sm btn-outline"
                        >
                          Save
                        </button>
                      </form>
                    )}
                  </td>

                  {/* Active status */}
                  <td>
                    <span className={`badge ${u.isActive ? "badge-green" : "badge-red"}`}>
                      <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${u.isActive ? "bg-green-500" : "bg-red-500"}`} />
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="text-gray-500 text-xs whitespace-nowrap">
                    {formatDate(u.createdAt)}
                  </td>

                  {/* Deactivate / activate */}
                  <td>
                    {!isSelf && (
                      <form action={toggleActiveAction}>
                        <input type="hidden" name="userId"   value={u.id} />
                        <input type="hidden" name="isActive" value={String(u.isActive)} />
                        <button
                          type="submit"
                          className={`btn btn-sm ${u.isActive ? "btn-danger" : "btn-outline text-green-700 border-green-300 hover:bg-green-50"}`}
                        >
                          {u.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

