-- ============================================================================
--  Migration: per-house currency
--  Run this once in Supabase Dashboard -> SQL Editor -> New query -> Run.
--  (Only needed for databases created before currency support was added.
--   Fresh installs from schema.sql already include it.)
-- ============================================================================

-- 1. Add the column (defaults existing houses to USD).
alter table public.houses
  add column if not exists currency text not null default 'USD';

-- 2. Let create_house accept a currency. The old single-arg version must be
--    dropped first so the call isn't ambiguous.
drop function if exists public.create_house(text);

create or replace function public.create_house(p_name text, p_currency text default 'USD')
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

  loop
    v_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
    exit when not exists (select 1 from public.houses where join_code = v_code);
  end loop;

  insert into public.houses (name, join_code, created_by, currency)
  values (
    coalesce(nullif(trim(p_name), ''), 'My House'),
    v_code,
    auth.uid(),
    coalesce(nullif(trim(p_currency), ''), 'USD')
  )
  returning * into v_house;

  insert into public.house_members (house_id, user_id, role)
  values (v_house.id, auth.uid(), 'owner');

  return v_house;
end;
$$;

grant execute on function public.create_house(text, text) to authenticated;
