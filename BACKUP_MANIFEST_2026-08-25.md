# Shohada-app — Backup Manifest

Backup date: 2026-08-25
Source branch: `main`
Backup branch: `backup-2026-08-25-freeze`
Commit frozen: `11691bebc820762036c56cdb76bff36737dd2975`

## Purpose
This branch is a frozen recovery point before the next architecture phase. Do not develop directly on this branch.

## Repository structure

### Root
- `index.html` — GitHub Pages entry/redirect layer for the public site.
- `README.md` — project notes and basic repository documentation.

### `frontend/`
- `index.html` — main application page shell.
- `app.js` — main application logic: registration, search, approval/status flow, Supabase interaction and UI behavior.
- `master-loader.js` — central loader for the modular/fix scripts used by the current frontend.
- `navigation-fix.js` — navigation/back-button compatibility fixes.
- `runtime-fix.js` — runtime compatibility and stabilization layer around the existing application.
- `style.css` — shared/main application styling.
- `version-label.js` — frontend version label/display helper.

### Statistics module
- `statistics.html` — statistics page shell.
- `statistics.js` — statistics page rendering, tables, stage summaries and donut/bar visualizations.
- `statistics.css` — statistics page styling.
- `stats-label.js` — statistics/version labels and related display helper.
- `statistics-baseline-fix.js` — baseline/statistics reference-data correction layer.
- `statistics-donut-fix.js` — donut chart correction layer.
- `statistics-live.js` — live statistics integration layer.
- `statistics-live-bridge.js` — bridge between live data and statistics UI/calculation.
- `statistics-live-bridge-v2.js` — newer live bridge implementation/version.
- `statistics-live-calculator.js` — live statistics calculation layer.
- `statistics-live-ui.js` — small live-statistics UI helper.
- `statistics-live-note.txt` — note/documentation for the live statistics implementation.

### `ExcelData/`
- `martyrs_master_v2.xlsx` — current Excel master/reference data stored in the repository.
- `import_master_v2.py` — Excel import/processing utility.

## Important freeze rule
Do not modify the frozen branch during normal development. New work should be created separately and connected to the live application only after testing.

## Supabase
The production data is NOT copied into this public repository. The `public.martyrs` table currently has 2,730 rows and these columns:
`id, name, lastname, piece, grave_row, grave_number, stone_type, stage, notes, status, created_at, edited_at, edit_notes, father_name`.

A database export should be kept separately and privately. Never publish database rows, service-role keys, passwords, or other secrets into this repository.
