"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
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

// Sends a password-reset email to the signed-in user. The link in the email
// returns them to the app to set a new password.
export async function resetPassword() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { error: "You must be signed in to reset your password." };
  }

  const { ok } = await rateLimit("reset");
  if (!ok) {
    return { error: "Too many attempts. Please wait a minute and try again." };
  }

  const origin = headers().get("origin") ?? "";
  // The link in the email hits our callback route, which exchanges the
  // recovery code for a session and forwards to the set-new-password page.
  const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
    redirectTo: origin
      ? `${origin}/auth/callback?next=/reset-password`
      : undefined,
  });

  if (error) return { error: error.message };

  return {
    message: `We sent a password reset link to ${user.email}. Check your inbox.`,
  };
}

// Sets a new password for the current (recovery) session, then signs in.
export async function updatePassword(_prev: unknown, formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }
  if (password !== confirm) {
    return { error: "Passwords do not match." };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error:
        "Your reset link is invalid or has expired. Request a new one from the profile menu.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
