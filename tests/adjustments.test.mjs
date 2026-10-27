import assert from "node:assert/strict";
import fs from "node:fs";
import {
  emptyProfile,
  validateProfile,
  rankShows,
  ratingEvidence,
} from "../core.mjs";
import { examples } from "./recommendations.test.mjs";
const c = JSON.parse(
  fs.readFileSync(new URL("../catalog.json", import.meta.url)),
);
for (const p of [examples().contradictory, examples().contrasting]) {
  const baseline = rankShows(c, p),
    target = baseline.find((r) =>
      r.contributions.some((x) => x.key === "tone:warm"),
    );
  for (const action of ["more", "less", "ignore"]) {
    p.adjustments = { "tone:warm": action };
    const adjusted = rankShows(c, p).find((r) => r.show.id === target.show.id);
    if (action === "more") assert(adjusted.score > target.score);
    if (action === "less") assert(adjusted.score < target.score);
    if (action === "ignore")
      assert(
        adjusted.contributions
          .filter((x) => x.key === "tone:warm")
          .every((x) => x.weight === 0),
      );
    assert.deepEqual(validateProfile(p, c), p);
  }
  p.adjustments = {};
  assert.deepEqual(rankShows(c, p), baseline);
}
const sparse = emptyProfile(),
  s = c.shows.find((s) => s.title === "Cheers");
sparse.ratings[s.id] = "yes";
sparse.viewing[s.id] = "seen";
assert(Object.values(ratingEvidence(c, sparse)).every((e) => e.count === 1));
assert.throws(() =>
  validateProfile({ ...sparse, adjustments: { fake: "more" } }, c),
);
assert.deepEqual(
  validateProfile(
    { format: sparse.format, version: 3, ratings: {}, viewing: {}, survey: {} },
    c,
  ).adjustments,
  {},
);
console.log(
  "Corrections, ignore, reset, conflicting/sparse evidence, v3 migration and backups passed.",
);
