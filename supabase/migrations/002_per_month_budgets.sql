-- ============================================================================
--  Migration: per-month section budgets
--  Run in Supabase Dashboard -> SQL Editor -> New query -> Run.
--
--  categories.monthly_budget stays as the recurring default a section uses
--  for any month with no override. This table holds explicit per-month
--  overrides (e.g. a higher Groceries budget in December).
-- ============================================================================

create table if not exists public.category_budgets (
  id          uuid primary key default gen_random_uuid(),
  house_id    uuid not null references public.houses (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  month       text not null, -- 'YYYY-MM'
  amount      numeric(12, 2) not null default 0,
  created_at  timestamptz not null default now(),
  unique (category_id, month)
);

create index if not exists idx_category_budgets_house
  on public.category_budgets (house_id, month);

alter table public.category_budgets enable row level security;

drop policy if exists category_budgets_all on public.category_budgets;
create policy category_budgets_all on public.category_budgets
  for all using (public.is_house_member(house_id)) with check (public.is_house_member(house_id));
