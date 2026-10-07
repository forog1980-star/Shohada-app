-- AI Quality: server-side live checks over public.martyrs.
-- Read-only analysis only. No martyrs INSERT/UPDATE/DELETE occurs here.

drop view if exists public.martyrs_quality_summary;
drop view if exists public.martyrs_quality_record_checks;

create view public.martyrs_quality_record_checks
with (security_invoker = true)
as
with base as (
  select
    m.*,
    lower(trim(regexp_replace(replace(replace(replace(replace(coalesce(m.name, ''), 'ي', 'ی'), 'ى', 'ی'), 'ك', 'ک'), 'ـ', ''), '\s+', ' ', 'g'))) as n_name,
    lower(trim(regexp_replace(replace(replace(replace(replace(coalesce(m.lastname, ''), 'ي', 'ی'), 'ى', 'ی'), 'ك', 'ک'), 'ـ', ''), '\s+', ' ', 'g'))) as n_lastname,
    lower(trim(regexp_replace(replace(replace(replace(replace(coalesce(m.piece, ''), 'ي', 'ی'), 'ى', 'ی'), 'ك', 'ک'), 'ـ', ''), '\s+', ' ', 'g'))) as n_piece,
    lower(trim(regexp_replace(replace(replace(replace(replace(coalesce(m.grave_row, ''), 'ي', 'ی'), 'ى', 'ی'), 'ك', 'ک'), 'ـ', ''), '\s+', ' ', 'g'))) as n_row,
    lower(trim(regexp_replace(replace(replace(replace(replace(coalesce(m.grave_number, ''), 'ي', 'ی'), 'ى', 'ی'), 'ك', 'ک'), 'ـ', ''), '\s+', ' ', 'g'))) as n_number,
    lower(trim(regexp_replace(replace(replace(replace(replace(coalesce(m.stone_type, ''), 'ي', 'ی'), 'ى', 'ی'), 'ك', 'ک'), 'ـ', ''), '\s+', ' ', 'g'))) as n_stone,
    lower(trim(regexp_replace(replace(replace(replace(replace(coalesce(m.stage, ''), 'ي', 'ی'), 'ى', 'ی'), 'ك', 'ک'), 'ـ', ''), '\s+', ' ', 'g'))) as n_stage
  from public.martyrs m
),
normalized as (
  select
    b.*,
    case b.n_stage
      when 'ارسال طرح سنگ به واحد مرمت' then 'ارسال طرح سنگ به واحد مرمت'
      when 'سنگ مرمتی آماده نصب است' then 'سنگ مرمتی آماده نصب است'
      when 'سنگ مرمت شده نصب شد' then 'سنگ مرمت شده نصب شد'
      when 'طرح آماده ارسال به واحد مرمت' then 'ارسال طرح سنگ به واحد مرمت'
      when 'طرح سنگ به واحد مرمت ارسال شد' then 'ارسال طرح سنگ به واحد مرمت'
      when 'ارسال به واحد مرمت' then 'ارسال طرح سنگ به واحد مرمت'
      when 'سنگ آماده ارسال به واحد مرمت' then 'ارسال طرح سنگ به واحد مرمت'
      when 'سنگ مرمتی آماده' then 'سنگ مرمتی آماده نصب است'
      when 'نصب سنگ مرمت شده' then 'سنگ مرمت شده نصب شد'
      when 'نصب مرمتی شده' then 'سنگ مرمت شده نصب شد'
      when 'نصب سنگ مرمتی شده' then 'سنگ مرمت شده نصب شد'
      when 'ارسال طرح سنگ به واحد تعویض' then 'ارسال طرح سنگ به واحد تعویض'
      when 'سنگ تعویضی آماده نصب است' then 'سنگ تعویضی آماده نصب است'
      when 'سنگ تعویضی نصب شد' then 'سنگ تعویضی نصب شد'
      when 'طرح آماده ارسال به واحد تعویض' then 'ارسال طرح سنگ به واحد تعویض'
      when 'طرح سنگ به واحد تعویض ارسال شد' then 'ارسال طرح سنگ به واحد تعویض'
      when 'ارسال به واحد تعویض' then 'ارسال طرح سنگ به واحد تعویض'
      when 'سنگ آماده ارسال به واحد تعویض' then 'ارسال طرح سنگ به واحد تعویض'
      when 'سنگ تعویضی آماده' then 'سنگ تعویضی آماده نصب است'
      when 'تعویضی نصب شده' then 'سنگ تعویضی نصب شد'
      when 'نصب تعویضی شده' then 'سنگ تعویضی نصب شد'
      when 'نصب سنگ تعویضی شده' then 'سنگ تعویضی نصب شد'
      when 'نصب سنگ تعویضی آماده شده' then 'سنگ تعویضی نصب شد'
      else b.n_stage
    end as stage_standard
  from base b
),
identity_stats as (
  select n_name, n_lastname,
    count(*)::bigint as identity_count,
    count(distinct case
      when n_piece <> '' and n_row <> '' and n_number <> ''
      then concat(n_piece, '|', n_row, '|', n_number)
    end)::bigint as identity_location_count
  from normalized
  group by n_name, n_lastname
),
location_stats as (
  select n_piece, n_row, n_number,
    count(*)::bigint as location_count,
    count(distinct case
      when n_name <> '' or n_lastname <> ''
      then concat(n_name, '|', n_lastname)
    end)::bigint as location_identity_count
  from normalized
  group by n_piece, n_row, n_number
),
full_stats as (
  select n_name, n_lastname, n_piece, n_row, n_number,
    count(*)::bigint as full_key_count
  from normalized
  group by n_name, n_lastname, n_piece, n_row, n_number
),
flags as (
  select
    n.*,
    coalesce(i.identity_count, 0) as identity_count,
    coalesce(i.identity_location_count, 0) as identity_location_count,
    coalesce(l.location_count, 0) as location_count,
    coalesce(l.location_identity_count, 0) as location_identity_count,
    coalesce(f.full_key_count, 0) as full_key_count,
    array_remove(array[
      case when n.n_row = '' then 'ردیف مزار خالی' end,
      case when n.n_number = '' then 'شماره مزار خالی' end,
      case when n.n_stage = '' then 'مرحله خالی' end,
      case when coalesce(i.identity_count,0) > 1 then 'نام/هویت تکراری یا چندرکوردی' end,
      case when n.n_piece = '' then 'قطعه خالی' end,
      case when n.n_piece <> '' and n.n_piece not in ('17','24','26','27','28','29','40','53') then 'خارج از محدوده ۸ قطعه آماری' end,
      case when n.n_piece <> '' and n.n_row <> '' and n.n_number <> '' and coalesce(l.location_count,0) > 1 then 'موقعیت مزار تکراری' end,
      case when n.n_stone = '' then 'نوع سنگ خالی' end,
      case when n.n_name = '' then 'نام خالی' end,
      case when n.n_name = '' or n.n_lastname = '' or n.n_piece = '' or n.n_row = '' or n.n_number = '' then 'رکورد ناقص' end,
      case when coalesce(f.full_key_count,0) > 1
             and n.n_name <> '' and n.n_lastname <> '' and n.n_piece <> '' and n.n_row <> '' and n.n_number <> ''
           then 'گروه تکراری کامل' end,
      case when coalesce(i.identity_location_count,0) > 1 and n.n_name <> '' and n.n_lastname <> ''
           then 'تعارض هویتی' end,
      case when coalesce(l.location_identity_count,0) > 1 and n.n_piece <> '' and n.n_row <> '' and n.n_number <> ''
           then 'تعارض محل' end,
      case when n.n_stage <> '' and n.stage_standard <> n.n_stage and n.stage_standard <> ''
           then 'نیازمند یکسان‌سازی مرحله' end,
      case when n.n_stage <> '' and n.stage_standard = n.n_stage
             and n.n_stage not in (
               'ارسال طرح سنگ به واحد مرمت',
               'سنگ مرمتی آماده نصب است',
               'سنگ مرمت شده نصب شد',
               'ارسال طرح سنگ به واحد تعویض',
               'سنگ تعویضی آماده نصب است',
               'سنگ تعویضی نصب شد'
             )
           then 'مرحله ناشناخته' end
    ], null) as issue_names
  from normalized n
  left join identity_stats i
    on i.n_name = n.n_name and i.n_lastname = n.n_lastname
  left join location_stats l
    on l.n_piece = n.n_piece and l.n_row = n.n_row and l.n_number = n.n_number
  left join full_stats f
    on f.n_name = n.n_name
   and f.n_lastname = n.n_lastname
   and f.n_piece = n.n_piece
   and f.n_row = n.n_row
   and f.n_number = n.n_number
)
select
  id, name, lastname, father_name, piece, grave_row, grave_number,
  stone_type, stage, notes, status, created_at, edited_at, edit_notes,
  array_to_string(issue_names, '، ') as problems,
  issue_names,
  cardinality(issue_names) as issue_count,
  case
    when cardinality(issue_names) = 0 then 'clean'
    when 'نام/هویت تکراری یا چندرکوردی' = any(issue_names)
      or 'گروه تکراری کامل' = any(issue_names) then 'duplicate'
    when 'موقعیت مزار تکراری' = any(issue_names)
      or 'تعارض محل' = any(issue_names)
      or 'خارج از محدوده ۸ قطعه آماری' = any(issue_names)
    then 'invalid'
    else 'problem'
  end as quality_status
from flags;

create view public.martyrs_quality_summary
with (security_invoker = true)
as
with record_checks as (
  select * from public.martyrs_quality_record_checks
),
issue_counts as (
  select issue_name as metric_name, count(*)::bigint as metric_count
  from record_checks
  cross join lateral unnest(issue_names) as u(issue_name)
  group by issue_name
),
full_duplicate_groups as (
  select 1
  from record_checks
  where 'گروه تکراری کامل' = any(issue_names)
  group by name, lastname, piece, grave_row, grave_number
),
identity_conflict_groups as (
  select 1
  from record_checks
  where 'تعارض هویتی' = any(issue_names)
  group by name, lastname
),
location_conflict_groups as (
  select 1
  from record_checks
  where 'تعارض محل' = any(issue_names)
  group by piece, grave_row, grave_number
),
base_metrics as (
  select 'کل رکوردها'::text as metric_name, 'summary'::text as category, count(*)::bigint as metric_count from record_checks
  union all
  select 'بدون مشکل','summary',count(*) from record_checks where quality_status='clean'
  union all
  select 'دارای مشکل','summary',count(*) from record_checks where quality_status <> 'clean'
  union all
  select 'گروه‌های تکراری کامل','intelligence',count(*) from full_duplicate_groups
  union all
  select 'تعارض هویتی','intelligence',count(*) from identity_conflict_groups
  union all
  select 'تعارض محل','intelligence',count(*) from location_conflict_groups
  union all
  select 'رکورد ناقص','intelligence',count(*) from record_checks where 'رکورد ناقص'=any(issue_names)
  union all
  select 'موارد نیازمند یکسان‌سازی مرحله','intelligence',count(*) from record_checks where 'نیازمند یکسان‌سازی مرحله'=any(issue_names)
  union all
  select 'مراحل ناشناخته','intelligence',count(*) from record_checks where 'مرحله ناشناخته'=any(issue_names)
),
quality_metrics as (
  select metric_name, 'quality'::text as category, metric_count
  from issue_counts
  where metric_name in (
    'ردیف مزار خالی',
    'شماره مزار خالی',
    'مرحله خالی',
    'نام/هویت تکراری یا چندرکوردی',
    'قطعه خالی',
    'خارج از محدوده ۸ قطعه آماری',
    'موقعیت مزار تکراری',
    'نوع سنگ خالی',
    'نام خالی'
  )
)
select metric_name, category, metric_count from base_metrics
union all
select metric_name, category, metric_count from quality_metrics
order by category, metric_name;

grant select on public.martyrs_quality_record_checks to anon, authenticated;
grant select on public.martyrs_quality_summary to anon, authenticated;
