"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _prevState: LoginState | undefined,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();
  const redirectTo = formData.get("redirectTo")?.toString() || "/admin/products";

  if (!email || !password) {
    return { error: "Please provide both email and password." };
  }

  const supabase = await createClient({ writable: true });
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message || "Invalid login credentials." };
  }

  redirect(redirectTo);
}

export async function logoutAction() {
  const supabase = await createClient({ writable: true });
  await supabase.auth.signOut();
  redirect("/admin/login");
}

