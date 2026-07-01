-- ============================================================================
--  House Expense Tracker — Supabase schema
--  Run this in the Supabase Dashboard -> SQL Editor -> New query -> Run.
--  Safe to re-run: uses "if not exists" / "or replace" where possible.
-- ============================================================================

-- ---------------------------------------------------------------------------
--  Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
--  Tables
-- ---------------------------------------------------------------------------

-- One row per authenticated user, mirroring auth.users.
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  email        text,
  created_at   timestamptz not null default now()
);

-- A household that one or more users collaborate on.
create table if not exists public.houses (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  join_code  text not null unique,
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Membership: which users belong to which house.
create table if not exists public.house_members (
  house_id  uuid not null references public.houses (id) on delete cascade,
  user_id   uuid not null references auth.users (id) on delete cascade,
  role      text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (house_id, user_id)
);

-- Sections like Rent, Loan, Groceries. `kind` distinguishes fixed
-- commitments from variable spending. `monthly_budget` is the plan.
create table if not exists public.categories (
  id             uuid primary key default gen_random_uuid(),
  house_id       uuid not null references public.houses (id) on delete cascade,
  name           text not null,
  kind           text not null default 'spending' check (kind in ('commitment', 'spending')),
  monthly_budget numeric(12, 2) not null default 0,
  color          text not null default '#6366f1',
  created_at     timestamptz not null default now()
);

-- Income entries (salary, bonus, etc.).
create table if not exists public.incomes (
  id          uuid primary key default gen_random_uuid(),
  house_id    uuid not null references public.houses (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete set null,
  source      text not null,
  amount      numeric(12, 2) not null check (amount >= 0),
  received_on date not null default current_date,
  note        text,
  created_at  timestamptz not null default now()
);

-- Individual spends against a category.
create table if not exists public.expenses (
  id          uuid primary key default gen_random_uuid(),
  house_id    uuid not null references public.houses (id) on delete cascade,
  category_id uuid references public.categories (id) on delete set null,
  user_id     uuid not null references auth.users (id) on delete set null,
  amount      numeric(12, 2) not null check (amount >= 0),
  description text,
  spent_on    date not null default current_date,
  created_at  timestamptz not null default now()
);

create index if not exists idx_categories_house on public.categories (house_id);
create index if not exists idx_incomes_house    on public.incomes (house_id, received_on);
create index if not exists idx_expenses_house   on public.expenses (house_id, spent_on);
create index if not exists idx_expenses_cat     on public.expenses (category_id);
create index if not exists idx_members_user     on public.house_members (user_id);

-- ---------------------------------------------------------------------------
--  Helper functions (SECURITY DEFINER -> bypass RLS to avoid recursion)
-- ---------------------------------------------------------------------------

create or replace function public.is_house_member(p_house uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.house_members
    where house_id = p_house and user_id = auth.uid()
  );
$$;

create or replace function public.shares_house_with(p_user uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.house_members me
    join public.house_members them on them.house_id = me.house_id
    where me.user_id = auth.uid() and them.user_id = p_user
  );
$$;

-- Create a house and make the caller its owner, atomically.
create or replace function public.create_house(p_name text)
returns public.houses
language plpgsql
security definer
set search_path = public
as $$
declare
  v_house public.houses;
  v_code  text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  -- Generate a short, unique, human-friendly join code.
  loop
    v_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
    exit when not exists (select 1 from public.houses where join_code = v_code);
  end loop;

  insert into public.houses (name, join_code, created_by)
  values (coalesce(nullif(trim(p_name), ''), 'My House'), v_code, auth.uid())
  returning * into v_house;

  insert into public.house_members (house_id, user_id, role)
  values (v_house.id, auth.uid(), 'owner');

  return v_house;
end;
$$;

-- Join an existing house by its join code.
create or replace function public.join_house(p_code text)
returns public.houses
language plpgsql
security definer
set search_path = public
as $$
declare
  v_house public.houses;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_house
  from public.houses
  where join_code = upper(trim(p_code));

  if v_house.id is null then
    raise exception 'No house found with that code';
  end if;

  insert into public.house_members (house_id, user_id, role)
  values (v_house.id, auth.uid(), 'member')
  on conflict (house_id, user_id) do nothing;

  return v_house;
end;
$$;

-- ---------------------------------------------------------------------------
--  New-user trigger: auto-create a profile row.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
--  Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles      enable row level security;
alter table public.houses        enable row level security;
alter table public.house_members enable row level security;
alter table public.categories    enable row level security;
alter table public.incomes       enable row level security;
alter table public.expenses      enable row level security;

-- profiles ------------------------------------------------------------------
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (id = auth.uid() or public.shares_house_with(id));

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- houses --------------------------------------------------------------------
drop policy if exists houses_select on public.houses;
create policy houses_select on public.houses
  for select using (public.is_house_member(id));

drop policy if exists houses_update on public.houses;
create policy houses_update on public.houses
  for update using (public.is_house_member(id)) with check (public.is_house_member(id));

-- house_members -------------------------------------------------------------
drop policy if exists members_select on public.house_members;
create policy members_select on public.house_members
  for select using (public.is_house_member(house_id));

-- A user may remove their own membership (leave a house).
drop policy if exists members_delete_self on public.house_members;
create policy members_delete_self on public.house_members
  for delete using (user_id = auth.uid());

-- categories ----------------------------------------------------------------
drop policy if exists categories_all on public.categories;
create policy categories_all on public.categories
  for all using (public.is_house_member(house_id)) with check (public.is_house_member(house_id));

-- incomes -------------------------------------------------------------------
drop policy if exists incomes_all on public.incomes;
create policy incomes_all on public.incomes
  for all using (public.is_house_member(house_id)) with check (public.is_house_member(house_id));

-- expenses ------------------------------------------------------------------
drop policy if exists expenses_all on public.expenses;
create policy expenses_all on public.expenses
  for all using (public.is_house_member(house_id)) with check (public.is_house_member(house_id));

-- ---------------------------------------------------------------------------
--  Grants (RPCs must be callable by authenticated users)
-- ---------------------------------------------------------------------------
grant execute on function public.create_house(text)      to authenticated;
grant execute on function public.join_house(text)        to authenticated;
grant execute on function public.is_house_member(uuid)   to authenticated;
grant execute on function public.shares_house_with(uuid) to authenticated;
