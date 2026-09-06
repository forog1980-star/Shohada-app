create table if not exists public.new_martyr_registrations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_readable text,
  family text not null,
  father_name text not null,
  gender text,
  birth_day smallint,
  birth_month smallint,
  birth_year smallint,
  death_day smallint,
  death_month smallint,
  death_year smallint,
  age smallint,
  operation text,
  martyrdom_area text,
  piece text not null,
  grave_row text not null,
  grave_number text not null,
  notes text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint new_martyr_registrations_status_check check (status in ('pending','approved','needs_correction','rejected')),
  constraint new_martyr_registrations_birth_day_check check (birth_day is null or birth_day between 1 and 31),
  constraint new_martyr_registrations_birth_month_check check (birth_month is null or birth_month between 1 and 12),
  constraint new_martyr_registrations_death_day_check check (death_day is null or death_day between 1 and 31),
  constraint new_martyr_registrations_death_month_check check (death_month is null or death_month between 1 and 12)
);

create or replace function public.set_new_martyr_registration_derived_fields()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  if new.birth_year is not null and new.death_year is not null then
    new.age := new.death_year - new.birth_year
      - case
          when new.birth_month is not null and new.death_month is not null and new.birth_day is not null and new.death_day is not null
               and (new.death_month, new.death_day) < (new.birth_month, new.birth_day) then 1
          when new.birth_month is not null and new.death_month is not null and new.birth_day is null then
               case when new.death_month < new.birth_month then 1 else 0 end
          else 0
        end;
  else
    new.age := null;
  end if;
  return new;
end;
$$;

create or replace trigger trg_new_martyr_registration_derived_fields
before insert or update on public.new_martyr_registrations
for each row execute function public.set_new_martyr_registration_derived_fields();

alter table public.new_martyr_registrations enable row level security;
revoke all on table public.new_martyr_registrations from anon, authenticated;
grant select, insert, update on table public.new_martyr_registrations to authenticated;

drop policy if exists "new_martyr_authenticated_insert_pending" on public.new_martyr_registrations;
drop policy if exists "new_martyr_reviewer_select" on public.new_martyr_registrations;
drop policy if exists "new_martyr_reviewer_update" on public.new_martyr_registrations;

create policy "new_martyr_authenticated_insert_pending"
on public.new_martyr_registrations
for insert
to authenticated
with check (status = 'pending');

create policy "new_martyr_reviewer_select"
on public.new_martyr_registrations
for select
to authenticated
using ((select coalesce((select auth.jwt())->'app_metadata'->>'role','')) in ('reviewer','admin'));

create policy "new_martyr_reviewer_update"
on public.new_martyr_registrations
for update
to authenticated
using ((select coalesce((select auth.jwt())->'app_metadata'->>'role','')) in ('reviewer','admin'))
with check (status in ('pending','approved','needs_correction','rejected'));

comment on table public.new_martyr_registrations is 'Independent registration bank for newly submitted martyr records. Does not replace or modify public.martyrs.';
comment on column public.new_martyr_registrations.age is 'Derived automatically from birth/death date components; not an independent source of truth.';
