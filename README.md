# Sitcom Tracker and Recommender

A learning project for ENG 6806: build a personal sitcom discovery tool while practicing plain HTML, CSS, JavaScript, and GitHub version control.

Users will record shows they have seen without having to rate them, optionally rate selected shows, answer a short taste survey, and receive explainable recommendations. Efficient history entry matters for people who have watched television for decades.

## Current stage

Stage 1: inspect the repository and dataset and document the plan. No webpage has been built.

The repository root inspected on October 27, 2026 contains `catalog.json` and `ChatGPTcatalog.json`. Before this README was added, there was no existing webpage code or README on the inspected default branch. Preserve both catalogs; the latter is a reference snapshot only.

## Working dataset

Load only the repository's `catalog.json`. Do not merge or load reference snapshots. The uploaded inspection copy, named `catalog(2).json`, matches the repository file's Git blob fingerprint: `940ba1fa0c46f27f5742e1e1df495e031f70bdab` (4,187,828 bytes).

Catalog version 3.0.0, built October 26, 2026, contains 304 English or predominantly English comedy series. It includes sitcoms, dramedies, and sketch entries; live-action, animated, and puppet media; and three premieres before 1970 whose original episodes continued into the 1970s. It is curated, not exhaustive.

| Section | Purpose |
| --- | --- |
| `meta` | Scope, missing-value rules, selection policy, field notes, reuse notes, and version history |
| `shows` | 304 show records with stable IDs |
| `vocabulary` | Definitions for ten categories of primary tags |
| `people` / `franchises` | 1,140 people and 26 franchise groups referenced by shows |
| `sources` | 701 source records for tracing claims |
| `id_aliases` | 515 mappings from old or existing IDs to canonical show IDs |
| `views` | Named lists of IDs for browsing and recommendation eligibility |
| `legacy_chatgpt_taxonomy` | Retained older tag definitions, separate from primary tags |
| `normalization_log` | Recorded data corrections and their sources |
| `quality_report` / `validation_schema` | Known audit limits and machine-readable structural expectations |

Show fields include title, alternate titles, IDs, country/language, kind/medium, years, explicit status, runtime, seasons, creators/stars, franchise and adaptation/spinoff references, and tags. Additional fields preserve awards, reception snapshots, qualification evidence, source claims, field provenance, uncertainty, and quality issues.

Primary tags describe format, devices, humor, tone, setting, themes, structure, audience, content, and cast. They can support filters and explainable taste matching later; they are editorial judgments, not measured facts.

## Use the catalog without changing it

- Read `shows` for browsing and history entry. Save personal history, optional ratings, and survey answers separately, keyed by canonical show ID.
- Resolve old IDs through `id_aliases` when importing personal data. Never regenerate an ID from a title or corrected premiere year.
- A seen show can remain unrated. Missing ratings are not dislikes; an unmarked show is not proof it has never been watched.
- Use `views.documented_selection` (165 shows) as the default recommendation pool. Let users explicitly include the 139 `reputation_review_candidates`. All 304 remain available for history entry.
- Exclude seen shows independently of recognition. Awards and recognition establish eligibility under the catalog's policy, not a higher personal match score.
- Preserve source links, uncertainty labels, and selection rules. Do not silently repair facts or merge legacy annotations into primary tags.
- Do not use `editorial_tag_weights` by default: these are unreviewed, order-derived estimates, not measured intensity.
- `null` means unknown, unchecked, or not applicable as documented. Empty arrays and missing tags do not prove absence. An unknown end date does not mean a show is running.
- Dates/statuses and reception scores are snapshots. Revival boundaries may need review. Calendar span includes hiatuses; it is not continuous years on air. Recorded award wins are not lifetime totals.
- Read `meta.source_reuse` when preparing publication: the catalog documents differing source terms and asserts no blanket license. Preserve attribution and review applicable reuse obligations before deployment.

## Inspection results

Basic checks on October 27, 2026 found:

- Valid JSON; 304 unique show IDs; no duplicate populated IMDb or TVmaze IDs.
- Actual show count matches `meta` and `quality_report`.
- All required show fields named by the embedded schema are present.
- All alias targets exist; each recorded legacy ID maps back to its show.
- Creator/star, franchise membership, non-null show-reference, and source-reference targets resolve.
- Primary tags occur in their declared controlled vocabulary.
- View lists have valid, nonduplicated IDs. The 165 default candidates and 139 review candidates form a disjoint partition of all 304 shows and agree with qualification status.

Qualification counts: 141 documented award recognition, 9 sourced recognition snapshots, 15 audience snapshot threshold, and 139 needing reputation evidence.

These are basic structural checks, not a complete JSON Schema validation or independent factual audit. The file's existing `quality_report.structural_validation` remains `pending`, and `factual_audit_complete` remains `false`; inspection did not rewrite either field. Source-linked claims can still be wrong or incomplete.

## Proposed files

| File | Role | Stage |
| --- | --- | --- |
| `README.md` | Project plan and development notes | 1 |
| `catalog.json` | Sole working catalog, kept separate and unchanged | Existing |
| `ChatGPTcatalog.json` | Reference snapshot; never loaded by the app | Existing |
| `index.html` | Page structure at repository root | 2 |
| `styles.css` | Appearance and responsive layout | 2 |
| `app.js` | Load catalog and add behavior incrementally | 2 onward |

No framework, build step, or server-side application. Personal data will live separately in browser storage, with backup/import planned later; it will not be committed to the repository. Browser storage belongs to a particular browser/site and can be cleared.

## Planned stages

1. Inspect the repository/catalog and review this README.
2. Build the static browsing page: load `catalog.json`, show basic information, search/filter, and handle loading errors.
3. Add efficient seen-history entry and optional ratings with separate local persistence.
4. Add a short taste survey stored in the personal profile.
5. Add explainable recommendations using the documented eligibility rules, preferences, and seen-show exclusions.
6. Add personal-data export/import with alias handling; check accessibility, mobile layout, and failure cases; prepare GitHub Pages deployment.

Complete and review one stage before implementing the next. Later features listed here are plans, not completed work.

## Development and version control

Make small, coherent changes. Explain important code and Git concepts in beginner-friendly language. Before each commit, check the change and review the diff (the lines added and removed). After committing, report what changed and provide a link for Karen to inspect.

Karen has authorized the assistant to handle repository edits, staging, clear commit messages, commits, pushes, and merges within the agreed project stage. Karen will inspect the resulting changes on GitHub. Continue one stage at a time; do not implement later features early. Deployment remains a later planned stage. The assistant must not write the assignment reflection.

A commit is a named snapshot of selected changes; pushing sends local commits to GitHub. For this first change, review only a new `README.md`; neither catalog should appear as modified. Suggested commit message: `Document sitcom tracker project plan`.

There is nothing to run in Stage 1. Once the page loads JSON in Stage 2, preview through a local HTTP server or GitHub Pages rather than relying on a double-clicked `file://` page. No build step will be introduced.
