export type CategoryKind = "commitment" | "spending";

export interface House {
  id: string;
  name: string;
  join_code: string;
  created_by: string;
  created_at: string;
}

export interface HouseMember {
  house_id: string;
  user_id: string;
  role: "owner" | "member";
  joined_at: string;
}

export interface Profile {
  id: string;
  display_name: string | null;
  email: string | null;
}

export interface Category {
  id: string;
  house_id: string;
  name: string;
  kind: CategoryKind;
  monthly_budget: number;
  color: string;
  created_at: string;
}

export interface Income {
  id: string;
  house_id: string;
  user_id: string | null;
  source: string;
  amount: number;
  received_on: string;
  note: string | null;
  created_at: string;
}

export interface Expense {
  id: string;
  house_id: string;
  category_id: string | null;
  user_id: string | null;
  amount: number;
  description: string | null;
  spent_on: string;
  created_at: string;
}
