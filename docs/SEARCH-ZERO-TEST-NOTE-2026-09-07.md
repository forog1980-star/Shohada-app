## Zero filter test

Expected behavior: grave row = 0 or grave number = 0 is not a valid location filter and should return 0 records.

The current search implementation already rejects normalized zero values; this note records the QA test that exposed stale asset caching on the deployed page. Asset query-string versions were advanced separately to force refresh.
