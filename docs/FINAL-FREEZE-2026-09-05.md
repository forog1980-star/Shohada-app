# GolzarStone / Shohada-app — Final Entry Freeze

**Freeze date:** 2026-09-05
**Final branch:** `final/shohada-entry-2026-09-05`
**Source branch:** `ui/all-martyrs-entry-design-2026-09-05`

## Frozen scope
- All Martyrs search module and reference data remain frozen.
- Stone-management modules remain frozen.
- Home/index navigation remains the controlled entry point.
- Single-entry design is preserved as the current development scope.
- Bulk entry remains present as a separate page/module and is not activated for database work.
- No Supabase schema or operational data changes are included in this freeze.

## Current navigation contract
Home exposes only:
1. `جستجوی شهدا در کل بهشت زهرا`
2. `مدیریت و بهسازی سنگ مزار`

All Martyrs submenu:
1. `جستجوی کل شهدا`
2. `افزودن نام تکی`
3. `افزودن نام گروهی`

Stone-management submenu:
1. `جستجوی شهید`
2. `ثبت اطلاعات`
3. `تأیید ثبت اطلاعات`
4. `گزارش‌های آماری`

## Single-entry design state
The single-entry flow contains:
- Main martyr identity fields
- Birth/death date fields with automatic age calculation
- Martyrdom operation and location
- Mandatory grave piece/row/number
- UI-only notes field
- Initial registration → confirmation/review flow
- Edit/back navigation
- Visible date validation
- Session-based draft recovery
- Final database registration intentionally disabled until the design is approved

## Data protection
- No writes to `public.martyrs` are part of this freeze.
- Master All Martyrs Excel data is not modified by the entry UI.
- Testing must use non-production/local data only.

## Synchronization rule
GitHub branch `final/shohada-entry-2026-09-05` is the canonical source for this frozen state. The local Windows worktree must be synchronized to the exact branch tip before testing. Do not test a stale local checkout against a newer GitHub branch.

## Backup rule
Keep both:
- GitHub final branch as the remote recovery copy.
- A local Git clone/worktree synchronized to the exact final commit as the local recovery copy.

Do not delete the existing recovery/frozen branches; they remain historical recovery points.
