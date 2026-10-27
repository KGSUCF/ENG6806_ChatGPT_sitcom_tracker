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

## Stage 4 — recommendation baseline

core.mjs extracts primary humor, tone, setting, themes, structure, format, and devices labels. For each feature, sum Yes=+2, No=-2, Meh=0 across rated shows, then divide by max(2, number of ratings with that feature). Thus one example is moderated; Meh supplies no direction and can dilute a pattern. Each candidate score is the mean of its feature weights, with missing evidence zero. All eligible shows are ranked, with canonical ID as the deterministic tie-break; display limits are applied afterward. Scores are not probabilities. Imported editorial weights, awards, and legacy tags never add score. Unreviewed tags still limit inference; averaging can dilute richly tagged shows.

Default eligibility: documented_selection (165) and explicitly Not seen. Independent opt-ins add Unknown status and/or reputation-review candidates (139). Seen always stays excluded. A broader display shows up to 50 after full-pool scoring. Explanations use actual signed contributions; every contribution is inspectable. With fewer than three ratings, the UI explicitly calls the evidence sparse. Even more ratings do not establish certainty.

Fixed profiles in tests/recommendations.test.mjs (all others Not seen): empty; contrasting (Cheers/Frasier Yes, South Park No); contradictory (Cheers Yes, Frasier No). Baseline top five: empty — 30 Rock, 3rd Rock from the Sun, Abbott Elementary, Absolutely Fabulous, Alice (all ties at zero); contrasting — Friends 1.231, Mad About You 1.125, Rhoda 1.083, Living Single 1.000, The Big Bang Theory 1.000; contradictory — Shrinking .308, Extras .273, Taxi .273, Alice .250, Barney Miller .250. These are reproducible diagnostics, not endorsements of recommendation quality.

Checks: deterministic results, full 165/304 pools, Seen exclusion without ratings, Unknown opt-in, contribution sums, conflicting evidence. Run `node tests/recommendations.test.mjs`. Manual: toggle Unknown, rate a suggestion and observe it disappear, Undo, and compare top-ten with broader discovery.

Commit: Add transparent full-pool recommendation baseline.

## Stage 5 — optional survey

Eight catalog-backed features: warm tone, witty banter, physical comedy, dark humor, cringe humor, workplace, episodic structure, mockumentary. More/Less contributes ±0.25 per feature; neutral contributes zero. Rating and survey contributions are separately inspectable. Ratings generally have stronger per-feature influence (one Yes/No gives ±1); conflicting ratings can cancel. A survey cannot manufacture missing tags or certainty. Reset affects only survey answers. Version 3 backups preserve all data; versions 1 and 2 migrate with an empty survey.

Comparison uses the same three fixed profiles and adds warm=More, cringe=Less. Neutral answers reproduce the baseline exactly. Contrasting profile retains its top five, with small score nudges (Friends 1.250, Mad About You 1.156, Rhoda 1.104, Living Single 1.023, Big Bang Theory 1.019). The contradictory profile becomes Shrinking, Taxi, Alice, The Kominsky Method, Barney Miller. With no ratings, survey-only ordering begins Mad About You, Ghosts (UK), Chico and the Man, Empty Nest, My Name Is Earl. These shifts reflect the explicit nudges, not demonstrated improvement. Sparse/no-rating results are still labeled cautiously.

Checks: neutral equivalence, survey vocabulary, invalid answers, earlier backup migration, round trips, plus DOM integration for filters, ratings, status confirmation, Undo, compact mode, recommendation limits/Seen exclusions, survey persistence and independent reset. `tests/interface.test.mjs` needs jsdom installed in the developer test environment; it is not a site dependency. Browser installation failed in the execution environment, so DOM checks are not visual browser verification. Manual: open/skip/revisit the survey; reset; import an older backup; check keyboard and phone layout.

Commit: Add optional catalog-based taste survey and compare baseline results.
