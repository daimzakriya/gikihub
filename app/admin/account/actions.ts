"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword:     z.string().min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export interface ChangePasswordState {
  error?: string;
  fieldErrors?: { currentPassword?: string[]; newPassword?: string[]; confirmPassword?: string[] };
  success?: boolean;
}

export async function changePasswordAction(
  _prev: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const raw = {
    currentPassword: formData.get("currentPassword") as string,
    newPassword:     formData.get("newPassword") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const parsed = ChangePasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as ChangePasswordState["fieldErrors"] };
  }

  const { currentPassword, newPassword } = parsed.data;

  const supabase = await createClient();

  // Get current user to know their email
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Session expired. Please log in again." };

  // Only email/password accounts can change passwords
  const identities = user.identities ?? [];
  const hasPasswordLogin = identities.some((id) => id.provider === "email");
  if (!hasPasswordLogin) {
    return { error: "Your account uses social login. Password change is not available." };
  }

  // Re-authenticate to verify the current password
  const { error: authError } = await supabase.auth.signInWithPassword({
    email:    user.email,
    password: currentPassword,
  });
  if (authError) return { error: "Current password is incorrect." };

  // Update to the new password
  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
  if (updateError) return { error: updateError.message };

  return { success: true };
}
