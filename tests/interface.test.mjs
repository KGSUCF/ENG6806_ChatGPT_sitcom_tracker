// Optional DOM integration checks: requires jsdom in the test environment only.
import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { JSDOM } = require("jsdom");
const root = new URL("../", import.meta.url),
  catalog = JSON.parse(fs.readFileSync(new URL("catalog.json", root)));
const dom = new JSDOM(fs.readFileSync(new URL("index.html", root), "utf8"), {
  url: "http://localhost:8000",
});
for (const key of ["document", "localStorage", "Option"])
  globalThis[key] = dom.window[key];
globalThis.CSS = { escape: (s) => s };
globalThis.confirm = () => true;
globalThis.fetch = async () => ({ ok: true, json: async () => catalog });
const app = fs
  .readFileSync(new URL("app.js", root), "utf8")
  .replace("./core.mjs", new URL("core.mjs", root).href);
await import(
  "data:text/javascript;base64," + Buffer.from(app).toString("base64")
);
await new Promise((r) => setTimeout(r, 30));
const $ = (id) => document.getElementById(id);
const event = (type) => new dom.window.Event(type, { bubbles: true });
assert.equal(
  document.querySelectorAll("#shows .card").length,
  30,
  $("message").textContent,
);
$("search").value = "Cheers";
$("search").dispatchEvent(event("input"));
assert.equal(document.querySelectorAll("#shows .card").length, 1);
const card = document.querySelector("#shows .card");
const id = card.querySelector("[data-rate]").dataset.id;
card.querySelector("[data-rate=yes]").click();
let p = JSON.parse(localStorage.getItem("couch-committee-profile"));
assert.equal(p.ratings[id], "yes");
assert.equal(p.viewing[id], "seen");
let sel = document.querySelector("#shows [data-view]");
globalThis.confirm = () => false;
sel.value = "not-seen";
sel.dispatchEvent(event("change"));
assert.equal(
  JSON.parse(localStorage.getItem("couch-committee-profile")).ratings[id],
  "yes",
);
globalThis.confirm = () => true;
sel = document.querySelector("#shows [data-view]");
sel.value = "not-seen";
sel.dispatchEvent(event("change"));
assert.equal(
  JSON.parse(localStorage.getItem("couch-committee-profile")).ratings[id],
  undefined,
);
$("undo").click();
assert.equal(
  JSON.parse(localStorage.getItem("couch-committee-profile")).ratings[id],
  "yes",
);
$("search").value = "";
$("search").dispatchEvent(event("input"));
$("compact").checked = true;
$("compact").dispatchEvent(event("change"));
assert.equal(document.querySelectorAll("#shows .card").length, 60);
$("include-unknown").checked = true;
$("include-unknown").dispatchEvent(event("change"));
assert.equal(document.querySelectorAll("#recommendations .card").length, 10);
$("discovery").checked = true;
$("discovery").dispatchEvent(event("change"));
assert.equal(document.querySelectorAll("#recommendations .card").length, 50);
assert(!document.querySelector(`#recommendations [data-view="${id}"]`));
const survey = $("survey-tone:warm");
survey.value = "1";
survey.dispatchEvent(event("change"));
assert.equal(
  JSON.parse(localStorage.getItem("couch-committee-profile")).survey[
    "tone:warm"
  ],
  1,
);
$("reset-survey").click();
p = JSON.parse(localStorage.getItem("couch-committee-profile"));
assert.deepEqual(p.survey, {});
assert.equal(p.ratings[id], "yes");
console.log(
  "DOM integration passed: cards, filters, status confirmation, undo, compact mode, recommendation limits/exclusions, survey save/reset.",
);
const correction = document.querySelector("[data-adjust]"),
  feature = correction.dataset.adjust;
correction.value = "ignore";
correction.dispatchEvent(event("change"));
assert.equal(
  JSON.parse(localStorage.getItem("couch-committee-profile")).adjustments[
    feature
  ],
  "ignore",
);
$("reset-adjustments").click();
p = JSON.parse(localStorage.getItem("couch-committee-profile"));
assert.deepEqual(p.adjustments, {});
assert.equal(p.ratings[id], "yes");
console.log("DOM feature corrections and independent reset passed.");
// Import is atomic, replacement-only, and cancelable.
const before = localStorage.getItem("couch-committee-profile");
async function importText(text) {
  await $("import").onchange({
    target: {
      files: [{ size: text.length, text: async () => text }],
      value: "file",
    },
  });
}
await importText("{broken");
assert.equal(localStorage.getItem("couch-committee-profile"), before);
globalThis.confirm = () => false;
await importText(
  JSON.stringify({
    format: "couch-committee-profile",
    version: 1,
    ratings: {},
  }),
);
assert.equal(localStorage.getItem("couch-committee-profile"), before);
globalThis.confirm = () => true;
await importText(
  JSON.stringify({
    format: "couch-committee-profile",
    version: 1,
    ratings: { [id]: "meh" },
  }),
);
p = JSON.parse(localStorage.getItem("couch-committee-profile"));
assert.equal(p.version, 4);
assert.equal(p.ratings[id], "meh");
assert.equal(p.viewing[id], "seen");
assert.deepEqual(p.survey, {});
assert.deepEqual(p.adjustments, {});
// Simulate a fresh page using the saved browser data.
const stored = localStorage.getItem("couch-committee-profile");
const fresh = new JSDOM(fs.readFileSync(new URL("index.html", root), "utf8"), {
  url: "http://localhost:8000",
});
for (const key of ["document", "localStorage", "Option"])
  globalThis[key] = fresh.window[key];
localStorage.setItem("couch-committee-profile", stored);
await import(
  "data:text/javascript;base64," +
    Buffer.from(app + "\n// fresh page").toString("base64")
);
await new Promise((r) => setTimeout(r, 20));
assert.equal(localStorage.getItem("couch-committee-profile"), stored);
assert(document.getElementById("counts").textContent.includes("1 rated"));
console.log(
  "Invalid/cancelled/legacy replacement import and refresh persistence passed.",
);
