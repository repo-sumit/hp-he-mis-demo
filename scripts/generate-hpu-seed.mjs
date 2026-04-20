#!/usr/bin/env node
/**
 * Reads .tmp/hpu_colleges.json (produced by parse-hpu.mjs) and emits a
 * deterministic TypeScript seed at
 *   packages/fixtures/src/generated/colleges-hpu.ts
 *
 * Every college is one (row-grouped) entry. Course codes are normalised to
 * the short form the UI already uses (BA, BCom, BSc, BCA, etc.). Districts
 * are mapped to the ids in packages/fixtures/src/districts.ts.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const records = JSON.parse(readFileSync(".tmp/hpu_colleges.json", "utf8"));

/** Slugify a name into a stable id. */
function slug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48);
}

/**
 * Preferred short ids for demo-critical colleges. These map onto the ids the
 * student-side `mock-data.ts` (combinations) and portal-side seeded
 * applications already reference, so upgrading the dataset doesn't force a
 * rename of every downstream fixture.
 */
const ID_ALIASES = [
  { match: /sanjauli/i, id: "gc_sanjauli" },
  { match: /rajkiya kanya mahavidyalaya.*shimla|rkmv/i, id: "rkmv_shimla" },
  { match: /govt\.? college dhar[am]+shala|govt\.? college dharmashala/i, id: "gc_dharamshala" },
  { match: /vikram batra.*palampur/i, id: "gc_palampur" },
  { match: /vallabh.*mandi/i, id: "vallabh_mandi" },
  { match: /^govt\.? college solan\b/i, id: "gc_solan" },
];

function preferredId(name, fallback) {
  for (const alias of ID_ALIASES) {
    if (alias.match.test(name)) return alias.id;
  }
  return fallback;
}

/** Normalise a district label to the id used in packages/fixtures/districts.ts. */
function districtId(label) {
  const key = (label || "").trim().toLowerCase();
  if (!key) return "";
  if (key.includes("lahaul")) return "lahaul_spiti";
  if (key.includes("kinnaur")) return "kinnaur";
  if (key.includes("kangra")) return "kangra";
  if (key.includes("chamba")) return "chamba";
  if (key.includes("hamirpur")) return "hamirpur";
  if (key.includes("mandi")) return "mandi";
  if (key.includes("shimla")) return "shimla";
  if (key.includes("sirmaur") || key.includes("sirmour")) return "sirmaur";
  if (key.includes("solan")) return "solan";
  if (key.includes("bilaspur")) return "bilaspur";
  if (key.includes("kullu")) return "kullu";
  if (key.includes("una")) return "una";
  return key.replace(/\s+/g, "_");
}

/** Map the institution_type column to our HPCollegeType enum. */
function collegeType(raw) {
  const t = (raw || "").trim().toLowerCase();
  if (t.includes("sanskrit")) return "sanskrit";
  if (t.includes("medical")) return "medical";
  if (t.includes("pharmacy")) return "pharmacy";
  if (t.includes("engineering")) return "engineering";
  if (t.includes("teacher")) return "teacher_education";
  if (t.includes("university")) return "university";
  if (t.includes("institute")) return "institute";
  // "College" or "Degree College" — all HP colleges in this dataset are Govt.
  return "government_degree";
}

/** Shorten very long degree strings into the codes the UI already uses. */
function courseCode(degreeName, courseName) {
  const d = (degreeName || "").trim();
  const c = (courseName || "").trim();
  if (!d && !c) return "";
  if (/Bachelor of Arts/i.test(d)) return "BA";
  if (/Bachelor of Commerce/i.test(d)) return "BCom";
  if (/Bachelor of Science \(Honours\)/i.test(d)) return "BSc-Hons";
  if (/Bachelor of Science/i.test(d)) return "BSc";
  if (/Bachelor of Computer Applications/i.test(d)) return "BCA";
  if (/Bachelor of Business Administration/i.test(d)) return "BBA";
  if (/Bachelor of Vocation/i.test(d)) return "BVoc";
  if (/Bachelor of Technology/i.test(d)) return "BTech";
  if (/Bachelor of Education/i.test(d)) return "BEd";
  if (/Bachelor of Medicine/i.test(d)) return "MBBS";
  if (/Bachelor of Pharmacy \(Ayurveda\)/i.test(d)) return "BPharm-Ayu";
  if (/Bachelor of Pharmacy/i.test(d)) return "BPharm";
  if (/Bachelor of Architecture/i.test(d)) return "BArch";
  if (/Bachelor of Laws/i.test(d)) return "LLB";
  if (/Bachelor of Ayurvedic/i.test(d)) return "BAMS";
  if (/Bachelor of Hotel Mgmt, Travel/i.test(d)) return "BHMTT";
  if (/Bachelor of Hotel Mgmt/i.test(d)) return "BHMCT";
  if (/Bachelor of Oriental Learning/i.test(d)) return "Shastri";
  if (/^Shastri/i.test(d)) return "Shastri";
  if (/^Acharya/i.test(d)) return "Acharya";
  if (/Master of Arts/i.test(d)) return "MA";
  if (/Master of Commerce/i.test(d)) return "MCom";
  if (/Master of Science \(by Research\)|Master of Surgery/i.test(d)) return "MS";
  if (/Master of Science/i.test(d)) return "MSc";
  if (/Master of Business Administration/i.test(d)) return "MBA";
  if (/Master of Computer Applications/i.test(d)) return "MCA";
  if (/Master of Travel/i.test(d)) return "MTTM";
  if (/Doctor of Medicine/i.test(d)) return "MD";
  if (/Post Graduate Diploma/i.test(d)) return "PGD";
  if (/Diploma/i.test(d)) return "Diploma";
  // Fallback — first letters of each word.
  return d
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .join("")
    .slice(0, 6)
    .toUpperCase();
}

function coEdStatus(name) {
  const n = name.toLowerCase();
  if (/\bkanya\b|\bmahila\b|\bgirl(s)?\b|\bwomen\b/.test(n)) return "women_only";
  if (/\bboys?\b/.test(n) && !/both/.test(n)) return "men_only";
  return "co_ed";
}

function hostelStatus(name, hostelFee) {
  const hasHostel = /\d/.test(hostelFee || "");
  if (!hasHostel) return "none";
  const coed = coEdStatus(name);
  if (coed === "women_only") return "girls";
  if (coed === "men_only") return "boys";
  return "both";
}

function cleanName(raw) {
  if (!raw) return "";
  // Titlecase from all-caps; keep punctuation.
  return raw
    .split(/\s+/)
    .map((w) =>
      /[A-Z]/.test(w) ? w[0] + w.slice(1).toLowerCase() : w,
    )
    .join(" ")
    .replace(/,\s*Himachal Pradesh|,\s*Hp\b|\bDistt\.? /gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** District labels that may appear suffixed in a raw college name. */
const DISTRICT_SUFFIXES = [
  "Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur", "Kullu",
  "Lahaul & Spiti", "Lahaul and Spiti", "Lahaul", "Mandi", "Shimla",
  "Sirmaur", "Sirmour", "Solan", "Una",
];

function stripDistrictSuffix(name) {
  let out = name;
  for (const d of DISTRICT_SUFFIXES) {
    const re = new RegExp(`[,.]\\s*${d}\\s*$`, "i");
    out = out.replace(re, "");
  }
  return out.trim();
}

function shortName(name) {
  let out = name
    .replace(/\s*\([^)]*\)/g, "") // strip parentheticals
    .replace(/\bDistrict\s+/gi, "")
    .replace(/,?\s*\bHp\b\.?/gi, "")
    .replace(/Government Degree College/gi, "Govt Degree College")
    .replace(/Government College/gi, "Govt College")
    .replace(/Govt\.\s*degree\s*College/gi, "Govt Degree College")
    .replace(/Govt\.\s*College/gi, "Govt College")
    .replace(/Govt\.college/gi, "Govt College")
    .replace(/Rajkiya Kanya Mahavidyalaya/gi, "RKMV")
    .replace(/\bShaheed Captain Vikram Batra Govt College\b/gi, "Vikram Batra Govt College")
    .replace(/\s+,/g, ",")
    .replace(/\s+/g, " ")
    .trim();
  // strip trailing district up to twice ("X, Bilaspur Hp" → "X" after Hp-strip + district-strip)
  out = stripDistrictSuffix(out);
  out = stripDistrictSuffix(out);
  out = out.replace(/[,.]\s*$/, "").trim();
  return out.slice(0, 64);
}

// Group rows by normalized_name — that's stable across repeat-course rows.
const byKey = new Map();
for (const r of records) {
  const key = (r.normalized_name || r.institution_name || "").trim();
  if (!key) continue;
  if (!byKey.has(key)) byKey.set(key, []);
  byKey.get(key).push(r);
}

const colleges = [];
let seq = 1;
for (const [, rows] of byKey) {
  const first = rows[0];
  const rawName = first.institution_name || first.normalized_name;
  const name = cleanName(rawName);
  const id = preferredId(name, slug(name));
  const district = districtId(first.district);
  const type = collegeType(first.institution_type);
  const coursesSet = new Set();
  for (const r of rows) {
    const code = courseCode(r.degree_name, r.course_name);
    if (code) coursesSet.add(code);
  }
  const courses = Array.from(coursesSet);
  const totalSeatsRaw = Number((first.total_intake_Y1_all_courses || "").toString());
  const totalSeats = Number.isFinite(totalSeatsRaw) && totalSeatsRaw > 0
    ? totalSeatsRaw
    : 300;
  colleges.push({
    aisheCode: `HPU-${String(seq).padStart(4, "0")}`,
    id,
    name,
    shortName: shortName(name),
    district,
    type,
    affiliatingUniversity: (first.affiliation || "Himachal Pradesh University").trim(),
    coEdStatus: coEdStatus(name),
    hostelAvailable: hostelStatus(name, first.hostel_fee),
    coursesOffered: courses,
    totalSanctionedSeats: totalSeats,
    isActive: true,
    website: first.official_website || undefined,
  });
  seq++;
}

// Sort colleges by district, then by name — makes the generated file diff-friendly.
colleges.sort((a, b) => {
  if (a.district !== b.district) return a.district.localeCompare(b.district);
  return a.name.localeCompare(b.name);
});

// Ensure stable id uniqueness (suffix dupes).
const seen = new Map();
for (const c of colleges) {
  const n = (seen.get(c.id) || 0) + 1;
  seen.set(c.id, n);
  if (n > 1) c.id = `${c.id}_${n}`;
}

// Emit TypeScript.
mkdirSync("packages/fixtures/src/generated", { recursive: true });

const header = `/**
 * GENERATED FILE — do not edit by hand.
 * Source: docs/HPU_167_Colleges_Data.xlsx
 * Regenerate with: \`node scripts/parse-hpu.mjs && node scripts/generate-hpu-seed.mjs\`
 *
 * Covers ${colleges.length} Himachal Pradesh higher-education institutions
 * across ${new Set(colleges.map((c) => c.district)).size} districts.
 */
import type { HPCollege } from "../colleges";

export const HP_COLLEGES: readonly HPCollege[] = `;

const body = JSON.stringify(colleges, null, 2);
const footer = `;

export const HP_COLLEGE_COUNT = HP_COLLEGES.length;
`;

writeFileSync("packages/fixtures/src/generated/colleges-hpu.ts", header + body + footer);

console.error(`Wrote ${colleges.length} colleges to packages/fixtures/src/generated/colleges-hpu.ts`);

// Breakdown summary for the PR description.
const byDistrict = {};
const byType = {};
for (const c of colleges) {
  byDistrict[c.district] = (byDistrict[c.district] || 0) + 1;
  byType[c.type] = (byType[c.type] || 0) + 1;
}
console.error("\nDistrict → count:");
for (const [k, v] of Object.entries(byDistrict).sort((a, b) => b[1] - a[1])) {
  console.error(`  ${k.padEnd(16)} ${v}`);
}
console.error("\nType → count:");
for (const [k, v] of Object.entries(byType).sort((a, b) => b[1] - a[1])) {
  console.error(`  ${k.padEnd(20)} ${v}`);
}

const allCourseCodes = new Set();
for (const c of colleges) for (const code of c.coursesOffered) allCourseCodes.add(code);
console.error(`\nDistinct course codes: ${allCourseCodes.size}`);
console.error([...allCourseCodes].sort().join(", "));
