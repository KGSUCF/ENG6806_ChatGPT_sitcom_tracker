import assert from "node:assert/strict";
import { sortShows } from "../core.mjs";
const shows = [
  { id: "z", title: "Zulu", years: { start: 2000 } },
  { id: "b", title: "Alpha", years: { start: 2024 } },
  { id: "a", title: "Alpha", years: { start: 2024 } },
  { id: "u", title: "Missing", years: { start: null } },
  { id: "o", title: "Old", years: { start: 1970 } },
];
const original = structuredClone(shows);
assert.deepEqual(
  sortShows(shows).map((s) => s.id),
  ["a", "b", "z", "o", "u"],
);
assert.deepEqual(
  sortShows(shows, "oldest").map((s) => s.id),
  ["o", "z", "a", "b", "u"],
);
assert.deepEqual(
  sortShows(shows, "title").map((s) => s.id),
  ["a", "b", "u", "o", "z"],
);
assert.deepEqual(shows, original);
assert.deepEqual(sortShows([]), []);
console.log(
  "Sort direction, title/ID ties, missing years, empty lists and immutability passed.",
);
