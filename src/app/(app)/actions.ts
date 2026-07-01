"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { ACTIVE_HOUSE_COOKIE } from "@/lib/house";

const num = (v: FormDataEntryValue | null) => {
  const n = parseFloat(String(v ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};
const str = (v: FormDataEntryValue | null) => String(v ?? "").trim();

function refresh() {
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/income");
  revalidatePath("/categories");
  revalidatePath("/house");
}

// ---- Houses ---------------------------------------------------------------

export async function createHouse(_prev: unknown, formData: FormData) {
  const name = str(formData.get("name")) || "My House";
  const supabase = createClient();
  const { data, error } = await supabase.rpc("create_house", { p_name: name });
  if (error) return { error: error.message };
  if (data?.id) {
    cookies().set(ACTIVE_HOUSE_COOKIE, data.id, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  }
  refresh();
  return { ok: true };
}

export async function joinHouse(_prev: unknown, formData: FormData) {
  const code = str(formData.get("code"));
  if (!code) return { error: "Enter a join code." };
  const supabase = createClient();
  const { data, error } = await supabase.rpc("join_house", { p_code: code });
  if (error) return { error: error.message };
  if (data?.id) {
    cookies().set(ACTIVE_HOUSE_COOKIE, data.id, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  }
  refresh();
  return { ok: true };
}

export async function switchHouse(houseId: string) {
  cookies().set(ACTIVE_HOUSE_COOKIE, houseId, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  refresh();
}

export async function renameHouse(formData: FormData) {
  const id = str(formData.get("house_id"));
  const name = str(formData.get("name"));
  if (!id || !name) return;
  const supabase = createClient();
  await supabase.from("houses").update({ name }).eq("id", id);
  refresh();
}

export async function leaveHouse(formData: FormData) {
  const houseId = str(formData.get("house_id"));
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from("house_members")
    .delete()
    .eq("house_id", houseId)
    .eq("user_id", user.id);
  cookies().delete(ACTIVE_HOUSE_COOKIE);
  refresh();
}

// ---- Categories -----------------------------------------------------------

export async function createCategory(_prev: unknown, formData: FormData) {
  const house_id = str(formData.get("house_id"));
  const name = str(formData.get("name"));
  if (!house_id || !name) return { error: "Name is required." };

  const supabase = createClient();
  const { error } = await supabase.from("categories").insert({
    house_id,
    name,
    kind: str(formData.get("kind")) === "commitment" ? "commitment" : "spending",
    monthly_budget: num(formData.get("monthly_budget")),
    color: str(formData.get("color")) || "#6366f1",
  });
  if (error) return { error: error.message };
  refresh();
  return { ok: true };
}

export async function updateCategory(formData: FormData) {
  const id = str(formData.get("id"));
  if (!id) return;
  const supabase = createClient();
  await supabase
    .from("categories")
    .update({
      name: str(formData.get("name")),
      kind: str(formData.get("kind")) === "commitment" ? "commitment" : "spending",
      monthly_budget: num(formData.get("monthly_budget")),
      color: str(formData.get("color")) || "#6366f1",
    })
    .eq("id", id);
  refresh();
}

export async function deleteCategory(formData: FormData) {
  const id = str(formData.get("id"));
  if (!id) return;
  const supabase = createClient();
  await supabase.from("categories").delete().eq("id", id);
  refresh();
}

// ---- Income ---------------------------------------------------------------

export async function addIncome(_prev: unknown, formData: FormData) {
  const house_id = str(formData.get("house_id"));
  const source = str(formData.get("source"));
  if (!house_id || !source) return { error: "Source is required." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("incomes").insert({
    house_id,
    user_id: user?.id,
    source,
    amount: num(formData.get("amount")),
    received_on: str(formData.get("received_on")) || new Date().toISOString().slice(0, 10),
    note: str(formData.get("note")) || null,
  });
  if (error) return { error: error.message };
  refresh();
  return { ok: true };
}

export async function deleteIncome(formData: FormData) {
  const id = str(formData.get("id"));
  if (!id) return;
  const supabase = createClient();
  await supabase.from("incomes").delete().eq("id", id);
  refresh();
}

// ---- Expenses -------------------------------------------------------------

export async function addExpense(_prev: unknown, formData: FormData) {
  const house_id = str(formData.get("house_id"));
  if (!house_id) return { error: "No active house." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const categoryId = str(formData.get("category_id"));

  const { error } = await supabase.from("expenses").insert({
    house_id,
    user_id: user?.id,
    category_id: categoryId || null,
    amount: num(formData.get("amount")),
    description: str(formData.get("description")) || null,
    spent_on: str(formData.get("spent_on")) || new Date().toISOString().slice(0, 10),
  });
  if (error) return { error: error.message };
  refresh();
  return { ok: true };
}

export async function deleteExpense(formData: FormData) {
  const id = str(formData.get("id"));
  if (!id) return;
  const supabase = createClient();
  await supabase.from("expenses").delete().eq("id", id);
  refresh();
}
