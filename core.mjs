// Pure data functions: no browser or storage access, so they are easy to test.
export const FORMAT = "couch-committee-profile";
export const VERSION = 4;
export const STORAGE_KEY = "couch-committee-profile";
export const emptyProfile = () => ({
  format: FORMAT,
  version: VERSION,
  ratings: {},
  viewing: {},
  survey: {},
  adjustments: {},
});
const object = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
export function validateProfile(raw, catalog) {
  if (
    !object(raw) ||
    raw.format !== FORMAT ||
    ![1, 2, 3, 4].includes(raw.version) ||
    !object(raw.ratings)
  )
    throw Error("Not a supported Couch Committee backup.");
  const next = emptyProfile(),
    ids = new Set(catalog.shows.map((s) => s.id));
  for (const [old, rating] of Object.entries(raw.ratings)) {
    const id = Object.hasOwn(catalog.id_aliases, old)
      ? catalog.id_aliases[old]
      : old;
    if (!ids.has(id)) throw Error(`Unknown show ID: ${old}`);
    if (!["yes", "meh", "no"].includes(rating))
      throw Error(`Invalid rating for ${old}`);
    if (Object.hasOwn(next.ratings, id))
      throw Error(
        `Two entries refer to ${id}; resolve the duplicate before importing.`,
      );
    next.ratings[id] = rating;
  }
  if (raw.version >= 2) {
    if (!object(raw.viewing)) throw Error("Missing viewing history.");
    for (const [old, status] of Object.entries(raw.viewing)) {
      const id = Object.hasOwn(catalog.id_aliases, old)
        ? catalog.id_aliases[old]
        : old;
      if (!ids.has(id) || !["unknown", "seen", "not-seen"].includes(status))
        throw Error(`Invalid viewing entry: ${old}`);
      if (Object.hasOwn(next.viewing, id))
        throw Error(`Duplicate viewing entry: ${id}`);
      next.viewing[id] = status;
    }
  }
  for (const id of Object.keys(next.ratings)) {
    if (raw.version >= 2 && next.viewing[id] !== "seen")
      throw Error(`Rated show must be Seen: ${id}`);
    next.viewing[id] = "seen";
  }
  if (raw.version >= 3) {
    if (!object(raw.survey)) throw Error("Missing survey answers.");
    for (const [key, value] of Object.entries(raw.survey)) {
      if (!SURVEY.some((q) => q.key === key) || ![-1, 0, 1].includes(value))
        throw Error("Invalid survey answer.");
      next.survey[key] = value;
    }
  }
  if (raw.version >= 4) {
    if (!object(raw.adjustments)) throw Error("Missing feature adjustments.");
    const allowed = new Set(catalog.shows.flatMap(features));
    for (const [key, value] of Object.entries(raw.adjustments)) {
      if (!allowed.has(key) || !["more", "less", "ignore"].includes(value))
        throw Error("Invalid feature adjustment.");
      next.adjustments[key] = value;
    }
  }
  return next;
}

export const statusOf = (profile, id) => profile.viewing[id] || "unknown";
export function setViewing(profile, id, status) {
  const next = structuredClone(profile);
  next.viewing[id] = status;
  if (status !== "seen") delete next.ratings[id];
  return next;
}

// Baseline: equal editorial labels, no imported intensity weights or award bonuses.
export const FEATURE_GROUPS = [
  "humor",
  "tone",
  "setting",
  "themes",
  "structure",
  "format",
  "devices",
];
export function features(show) {
  return FEATURE_GROUPS.flatMap((group) => {
    const values = show.tags[group];
    return (Array.isArray(values) ? values : values ? [values] : []).map(
      (value) => `${group}:${value}`,
    );
  });
}
export function ratingEvidence(catalog, profile) {
  const evidence = {};
  for (const show of catalog.shows) {
    const rating = profile.ratings[show.id];
    if (!rating) continue;
    for (const key of features(show)) {
      const e = (evidence[key] ??= {
        sum: 0,
        count: 0,
        yes: [],
        no: [],
        meh: [],
      });
      e.count++;
      e.sum += { yes: 2, meh: 0, no: -2 }[rating];
      e[rating].push(show);
    }
  }
  for (const e of Object.values(evidence))
    e.weight = e.sum / Math.max(2, e.count);
  return evidence;
}
export function rankShows(
  catalog,
  profile,
  { includeUnknown = false, includeCandidates = false } = {},
) {
  const evidence = ratingEvidence(catalog, profile);
  const eligible = new Set(catalog.views.documented_selection.show_ids);
  if (includeCandidates)
    for (const id of catalog.views.reputation_review_candidates.show_ids)
      eligible.add(id);
  return catalog.shows
    .filter(
      (show) =>
        eligible.has(show.id) &&
        (statusOf(profile, show.id) === "not-seen" ||
          (includeUnknown && statusOf(profile, show.id) === "unknown")),
    )
    .map((show) => {
      const keys = features(show),
        denominator = Math.max(1, keys.length);
      const contributions = keys
        .flatMap((key) =>
          profile.adjustments?.[key] === "ignore"
            ? [{ key, weight: 0, source: "ignored by you" }]
            : [
                { key, weight: evidence[key]?.weight || 0, source: "ratings" },
                {
                  key,
                  weight: (profile.survey?.[key] || 0) * 0.25,
                  source: "survey",
                },
                {
                  key,
                  weight:
                    profile.adjustments?.[key] === "more"
                      ? 1
                      : profile.adjustments?.[key] === "less"
                        ? -1
                        : 0,
                  source: "your adjustment",
                },
              ],
        )
        .map((c) => ({ ...c, contribution: c.weight / denominator }));
      return {
        show,
        score: contributions.reduce((sum, c) => sum + c.contribution, 0),
        contributions: contributions.sort(
          (a, b) =>
            Math.abs(b.contribution) - Math.abs(a.contribution) ||
            a.key.localeCompare(b.key),
        ),
        status: statusOf(profile, show.id),
      };
    })
    .sort(
      (a, b) => b.score - a.score || a.show.id.localeCompare(b.show.id, "en"),
    );
}

export const SURVEY = [
  {
    key: "tone:warm",
    question: "A warm, friendly tone",
    hint: "Comedy with a sense of affection.",
  },
  {
    key: "humor:witty-banter",
    question: "Quick, witty conversations",
    hint: "The fun comes from verbal back-and-forth.",
  },
  {
    key: "humor:physical",
    question: "Physical comedy",
    hint: "Movement and bodily mishaps help carry the jokes.",
  },
  {
    key: "humor:dark",
    question: "Dark humor",
    hint: "Comedy involving uncomfortable or grim subjects.",
  },
  {
    key: "humor:cringe",
    question: "Awkward, embarrassing situations",
    hint: "Cringe humor makes discomfort part of the joke.",
  },
  {
    key: "setting:workplace",
    question: "Workplace settings",
    hint: "Characters dealing with life on the job.",
  },
  {
    key: "structure:episodic",
    question: "Mostly standalone episodes",
    hint: "Stories generally work one episode at a time.",
  },
  {
    key: "devices:mockumentary",
    question: "Mock-documentary style",
    hint: "Fiction presented with documentary-style devices.",
  },
];
