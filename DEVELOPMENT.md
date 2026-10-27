# Development log and checks

## Local preview

From the repository folder, run `python -m http.server 8000` (Windows may use `py -m http.server 8000`). Open http://localhost:8000. Stop with Ctrl+C. Opening index.html directly cannot reliably fetch JSON. No install/build step is needed for the webpage. Node is optional for developer tests: `node tests/core.test.mjs`.

## Stage 2 — working tracker

Added root index.html, styles.css, app.js, core.mjs, and data validation tests. The page fetches only catalog.json. app.js handles browser events and storage; core.mjs contains validation without browser dependencies. A version-1 profile stores ratings by canonical show ID. Import is replacement, validated in full before confirmation and storage. Unknown IDs, invalid ratings, unsupported versions, and alias collisions are rejected. Storage failures are visible and do not silently overwrite data.

Checks: profile round trip, alias mapping, invalid versions/IDs/ratings; JavaScript syntax. Manual checklist: search a title; filter decade/type; change/clear Yes/Meh/No; refresh; export, change a rating, import and confirm replacement; cancel import; try invalid JSON; check mobile width and keyboard focus; temporarily rename catalog.json to see the loading error.

Commit: Build static tracker with ratings and validated personal backups.

## Stage 3 — decades of viewing history

Version 2 adds a viewing map alongside ratings: unknown, seen, not-seen. Missing entries mean Unknown. Version-1 ratings migrate to Seen without changing enjoyment. A rated show cannot remain Unknown/Not seen; changing it asks before clearing the rating. Seen alone requires no rating. Compact mode shows 60 records per page, status filtering narrows the checklist, and one-click Seen avoids opening a selector. “Too long ago to judge” records Seen with no rating. Undo retains 30 profile snapshots during the visit, including imports. It is not persisted after refresh.

Checks: earlier backup migration, contradictory rated/unseen import rejection, unknown defaults, Seen without rating, explicit rating removal. Manual: mark several shows Seen, undo, refresh; cancel and accept changing a rated show to Not seen; import a version-1 backup. Storage recovery permits a validated replacement backup after a damaged profile; export preserves the unreadable stored text for recovery.

Commit: Separate viewing history from ratings with compact entry and undo.
