# Development log and checks

## Local preview

From the repository folder, run `python -m http.server 8000` (Windows may use `py -m http.server 8000`). Open http://localhost:8000. Stop with Ctrl+C. Opening index.html directly cannot reliably fetch JSON. No install/build step is needed for the webpage. Node is optional for developer tests: `node tests/core.test.mjs`.

## Stage 2 — working tracker

Added root index.html, styles.css, app.js, core.mjs, and data validation tests. The page fetches only catalog.json. app.js handles browser events and storage; core.mjs contains validation without browser dependencies. A version-1 profile stores ratings by canonical show ID. Import is replacement, validated in full before confirmation and storage. Unknown IDs, invalid ratings, unsupported versions, and alias collisions are rejected. Storage failures are visible and do not silently overwrite data.

Checks: profile round trip, alias mapping, invalid versions/IDs/ratings; JavaScript syntax. Manual checklist: search a title; filter decade/type; change/clear Yes/Meh/No; refresh; export, change a rating, import and confirm replacement; cancel import; try invalid JSON; check mobile width and keyboard focus; temporarily rename catalog.json to see the loading error.

Commit: Build static tracker with ratings and validated personal backups.
