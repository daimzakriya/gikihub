import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/header";
import type { Role } from "@/types";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ── Auth check (middleware handles most cases, this is a belt-and-suspenders check) ──
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // ── Load profile ──────────────────────────────────────────
  const profile = await db.profile.findUnique({
    where: { id: user.id },
    select: { name: true, email: true, role: true, isActive: true },
  });

  if (!profile || !profile.isActive) redirect("/auth/login?error=account_inactive");

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar
        role={profile.role as Role}
        userName={profile.name}
        userEmail={profile.email}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader
          role={profile.role as Role}
          userName={profile.name}
          userEmail={profile.email}
        />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
