# Search cache-bust recovery note — 2026-09-07

The search page had already received the exact/similar grouping fix, but the page kept the old query-string version for JavaScript/CSS assets. This commit only advances asset version query strings so browsers fetch the current search code and result-group styling.

No source Excel data, Supabase schema, or operational data were changed.
