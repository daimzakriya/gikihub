// Supabase Auth callback handler
// Used for magic links, OAuth, email confirmations

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code  = searchParams.get("code");
  const next  = searchParams.get("next") ?? "/admin/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Ensure redirect is relative (prevent open redirect)
      const redirectUrl = next.startsWith("/") ? `${origin}${next}` : `${origin}/admin/dashboard`;
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
