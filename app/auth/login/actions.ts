"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { authLimiter, checkRateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

const LoginSchema = z.object({
  email:    z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  redirect: z.string().regex(/^\/(?!\/)/).optional(),
});

export interface LoginState {
  error?: string;
  fieldErrors?: { email?: string[]; password?: string[] };
  redirectTo?: string;
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  // ── 1. Parse & validate input ──────────────────────────────
  const raw = {
    email:    formData.get("email") as string,
    password: formData.get("password") as string,
    redirect: formData.get("redirect") ?? undefined,
  };

  const parsed = LoginSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { email, password } = parsed.data;
  const redirectTo = parsed.data.redirect ?? "/admin/dashboard";

  // ── 2. Rate limit by IP ────────────────────────────────────
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  const limited = await checkRateLimit(authLimiter, `login:${ip}`);
  if (limited) {
    return { error: "Too many login attempts. Please wait 15 minutes." };
  }

  // ── 3. Attempt Supabase Auth sign-in ──────────────────────
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    // Generic message — don't reveal whether email exists
    return { error: "Invalid email or password." };
  }

  // ── 4. Check profile exists and is active + has a role ────
  const adminClient = createAdminClient();
  const { data: profileRaw } = await adminClient
    .from("profiles")
    .select("role, isActive")
    .eq("id", data.user.id)
    .single();
  const profile = profileRaw as { role: string; isActive: boolean } | null;

  if (!profile) {
    await supabase.auth.signOut();
    return { error: "Account not found. Contact the administrator." };
  }

  if (!profile.isActive) {
    await supabase.auth.signOut();
    return { error: "Your account has been deactivated. Contact support." };
  }

  // ── 5. Success — return redirectTo so the client navigates
  //    (Next.js 15: redirect() inside a Server Action drops Set-Cookie headers;
  //     returning the URL lets the client-side router navigate AFTER cookies land)
  return { redirectTo };
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}
