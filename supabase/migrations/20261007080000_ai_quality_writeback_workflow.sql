-- AI data-quality write-back workflow
-- Persistent correction queue + reviewer-controlled application to public.martyrs.

create table if not exists public.martyr_quality_corrections (
  id uuid primary key default gen_random_uuid(),
  target_martyr_id bigint not null
    references public.martyrs(id) on delete restrict,
  source_edited_at timestamptz,
  original_record jsonb not null,
  proposed_record jsonb not null,
  reason_codes text[] not null default '{}',
  submitter_note text,
  status text not null default 'pending_review',
  submitted_by uuid,
  submitted_at timestamptz not null default now(),
  reviewed_by uuid,
  reviewed_at timestamptz,
  reviewer_note text,
  applied_at timestamptz,
  apply_error text,
  updated_at timestamptz not null default now(),
  constraint martyr_quality_corrections_status_check
    check (status in ('pending_review','needs_correction','rejected','applied'))
);

comment on table public.martyr_quality_corrections is
  'Persistent review queue for AI/data-quality corrections to existing public.martyrs records. Corrections are applied only after reviewer approval.';
comment on column public.martyr_quality_corrections.source_edited_at is
  'The edited_at value observed when the correction was submitted; approval rejects stale corrections if the source changed meanwhile.';
comment on column public.martyr_quality_corrections.original_record is
  'Read-only source snapshot captured at submission time for audit/comparison.';
comment on column public.martyr_quality_corrections.proposed_record is
  'Proposed replacement values. Only approved editable martyrs fields are applied.';

create unique index if not exists martyr_quality_corrections_one_open_per_target_idx
  on public.martyr_quality_corrections(target_martyr_id)
  where status in ('pending_review','needs_correction');

create or replace function public.set_martyr_quality_correction_meta()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  caller_role text := coalesce((select auth.jwt())->'app_metadata'->>'role', '');
begin
  if tg_op = 'INSERT' then
    new.status := 'pending_review';
    new.submitted_by := auth.uid();
    new.submitted_at := now();
    new.updated_at := now();
    new.reviewed_by := null;
    new.reviewed_at := null;
    new.applied_at := null;
    new.apply_error := null;
    return new;
  end if;

  if new.target_martyr_id is distinct from old.target_martyr_id
     or new.original_record is distinct from old.original_record
     or new.submitted_by is distinct from old.submitted_by
     or new.submitted_at is distinct from old.submitted_at then
    raise exception 'immutable correction fields cannot be changed';
  end if;

  if new.status = 'applied' then
    if current_setting('app.golzar_quality_approval', true) <> 'true' then
      raise exception 'approved status can only be applied by the controlled approval workflow';
    end if;
  elsif new.status in ('needs_correction','rejected') then
    if caller_role not in ('reviewer','admin') then
      raise exception 'reviewer role required for this status';
    end if;
    new.reviewed_by := auth.uid();
    new.reviewed_at := now();
  elsif new.status = 'pending_review' then
    new.reviewed_by := null;
    new.reviewed_at := null;
    new.applied_at := null;
    new.apply_error := null;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

create or replace trigger trg_martyr_quality_correction_meta
before insert or update on public.martyr_quality_corrections
for each row
execute function public.set_martyr_quality_correction_meta();

alter table public.martyr_quality_corrections enable row level security;

revoke all on table public.martyr_quality_corrections from anon, authenticated, public;
grant insert, select, update on table public.martyr_quality_corrections to authenticated;

drop policy if exists "mqc_submitter_insert" on public.martyr_quality_corrections;
drop policy if exists "mqc_select" on public.martyr_quality_corrections;
drop policy if exists "mqc_update" on public.martyr_quality_corrections;

create policy "mqc_submitter_insert"
on public.martyr_quality_corrections
for insert
to authenticated
with check (
  status = 'pending_review'
  and submitted_by = (select auth.uid())
);

create policy "mqc_select"
on public.martyr_quality_corrections
for select
to authenticated
using (
  submitted_by = (select auth.uid())
  or coalesce((select auth.jwt())->'app_metadata'->>'role','')
     in ('reviewer','admin')
);

create policy "mqc_update"
on public.martyr_quality_corrections
for update
to authenticated
using (
  (
    submitted_by = (select auth.uid())
    and status = 'needs_correction'
  )
  or coalesce((select auth.jwt())->'app_metadata'->>'role','')
     in ('reviewer','admin')
)
with check (
  (
    submitted_by = (select auth.uid())
    and status = 'pending_review'
  )
  or (
    coalesce((select auth.jwt())->'app_metadata'->>'role','')
      in ('reviewer','admin')
    and status in ('needs_correction','rejected')
  )
);

create or replace function public.approve_martyr_quality_correction(
  p_correction_id uuid,
  p_reviewer_id uuid,
  p_reviewer_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  c public.martyr_quality_corrections%rowtype;
  m public.martyrs%rowtype;
  new_name text;
  new_lastname text;
  new_father_name text;
  new_piece text;
  new_row text;
  new_number text;
  new_stone_type text;
  new_stage text;
  new_notes text;
  new_edit_notes text;
  now_ts timestamptz := now();
begin
  if p_reviewer_id is null then
    raise exception 'reviewer id is required';
  end if;

  select *
  into c
  from public.martyr_quality_corrections
  where id = p_correction_id
  for update;

  if not found then
    raise exception 'correction request not found';
  end if;

  if c.status <> 'pending_review' then
    raise exception 'correction request is not awaiting review';
  end if;

  select *
  into m
  from public.martyrs
  where id = c.target_martyr_id
  for update;

  if not found then
    raise exception 'target martyr record not found';
  end if;

  if c.source_edited_at is distinct from m.edited_at then
    raise exception 'source record changed after correction submission';
  end if;

  new_name := nullif(btrim(coalesce(c.proposed_record->>'name','')), '');
  new_lastname := nullif(btrim(coalesce(c.proposed_record->>'lastname','')), '');
  new_father_name := nullif(btrim(coalesce(c.proposed_record->>'father_name','')), '');
  new_piece := nullif(btrim(coalesce(c.proposed_record->>'piece','')), '');
  new_row := nullif(btrim(coalesce(c.proposed_record->>'grave_row','')), '');
  new_number := nullif(btrim(coalesce(c.proposed_record->>'grave_number','')), '');
  new_stone_type := nullif(btrim(coalesce(c.proposed_record->>'stone_type','')), '');
  new_stage := nullif(btrim(coalesce(c.proposed_record->>'stage','')), '');
  new_notes := nullif(btrim(coalesce(c.proposed_record->>'notes','')), '');

  if new_name is null or new_lastname is null then
    raise exception 'name and lastname are required';
  end if;

  if new_piece is null or new_row is null or new_number is null then
    raise exception 'piece, grave_row and grave_number are required';
  end if;

  if new_stone_type not in ('ترمیمی','تعویضی') then
    raise exception 'invalid stone_type';
  end if;

  if new_stage is null then
    raise exception 'stage is required';
  end if;

  if new_stage is distinct from m.stage then
    if new_stage not in (
      'ارسال به واحد مرمت',
      'ارسال طرح سنگ به واحد مرمت',
      'طرح آماده ارسال به واحد مرمت',
      'طرح سنگ به واحد مرمت ارسال شد',
      'سنگ آماده ارسال به واحد مرمت',
      'سنگ مرمتی آماده',
      'سنگ مرمتی آماده نصب است',
      'نصب مرمتی شده',
      'نصب سنگ مرمت شده',
      'سنگ مرمت شده نصب شد',
      'ارسال به واحد تعویض',
      'ارسال طرح سنگ به واحد تعویض',
      'طرح آماده ارسال به واحد تعویض',
      'طرح سنگ به واحد تعویض ارسال شد',
      'سنگ آماده ارسال به واحد تعویض',
      'سنگ تعویضی آماده',
      'سنگ تعویضی آماده نصب است',
      'تعویضی نصب شده',
      'نصب تعویضی شده',
      'نصب سنگ تعویضی شده',
      'نصب سنگ تعویضی آماده شده',
      'سنگ تعویضی نصب شد'
    ) then
      raise exception 'invalid stage label';
    end if;
  end if;

  new_edit_notes :=
    concat_ws(
      ' | ',
      nullif(btrim(coalesce(m.edit_notes,'')), ''),
      'اصلاح از کنترل کیفیت هوشمند؛ شناسه اصلاحیه ' || c.id::text ||
      case
        when nullif(btrim(coalesce(p_reviewer_note,'')), '') is not null
        then '؛ نظر ناظر: ' || btrim(p_reviewer_note)
        else ''
      end
    );

  perform set_config('app.golzar_quality_approval', 'true', true);

  update public.martyrs
  set
    name = new_name,
    lastname = new_lastname,
    father_name = new_father_name,
    piece = new_piece,
    grave_row = new_row,
    grave_number = new_number,
    stone_type = new_stone_type,
    stage = new_stage,
    notes = new_notes,
    edited_at = now_ts,
    edit_notes = new_edit_notes
  where id = c.target_martyr_id;

  update public.martyr_quality_corrections
  set
    status = 'applied',
    reviewed_by = p_reviewer_id,
    reviewed_at = now_ts,
    applied_at = now_ts,
    reviewer_note = nullif(btrim(coalesce(p_reviewer_note,'')), ''),
    apply_error = null,
    updated_at = now_ts
  where id = c.id;

  perform set_config('app.golzar_quality_approval', '', true);

  return jsonb_build_object(
    'success', true,
    'correction_id', c.id,
    'target_martyr_id', c.target_martyr_id,
    'status', 'applied',
    'applied_at', now_ts
  );
end;
$$;

revoke execute on function public.set_martyr_quality_correction_meta() from public, anon, authenticated;
revoke execute on function public.approve_martyr_quality_correction(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.approve_martyr_quality_correction(uuid, uuid, text) to service_role;
