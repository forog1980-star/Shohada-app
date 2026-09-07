# Search zero-filter retest

QA finding: entering grave row 0 and grave number 0 on the deployed page returned results, despite the current search logic rejecting normalized zero values. The most likely cause is stale cached JS/CSS assets because the HTML used the previous asset query-string versions.

Retest after deployment must confirm 0 records for row 0 and number 0.
