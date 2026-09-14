# Recovery Point — Search Exact Group Integration — 2026-09-14

## Scope
Integration fix for the flow:

`Search → Exact/Similar Grouping → Detail → Back → Exact/Similar Grouping`

## Branch
`fix/exact-filters-match-20260907`

## Commit
`3b282d4c4183fe38163b335cb298b7ff5a9b1b5c`

## Changed file
`frontend/search-exact-group-fix.js`

## Change
The exact-search grouping module now owns the restore path after it is loaded, keeps the exact-search filters and result data in the same cache used by the back-restore flow, and rebuilds the grouped exact/similar result view when returning from a detail page.

## Data safety
- No Supabase schema change.
- No Supabase data write.
- No operational records modified.
- No change to frozen `main` or final reference branch.

## Verification status
Static integration review completed against `frontend/search-back-restore-fix.js` and `frontend/master-loader.js`.
Browser/device runtime verification is still required before declaring the release production-ready.
