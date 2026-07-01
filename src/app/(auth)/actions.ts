"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/ratelimit";

export async function login(_prev: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const { ok } = await rateLimit("login");
  if (!ok) {
    return { error: "Too many attempts. Please wait a minute and try again." };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signup(_prev: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("display_name") ?? "").trim();

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const { ok } = await rateLimit("signup");
  if (!ok) {
    return { error: "Too many attempts. Please wait a minute and try again." };
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  });

  if (error) return { error: error.message };

  // If email confirmation is on, there is no session yet.
  if (!data.session) {
    return {
      message:
        "Check your email to confirm your account, then sign in. (You can also disable email confirmation in Supabase Auth settings.)",
    };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
