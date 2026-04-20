/**
 * Catalogue + seeded offerings used by the eligibility evaluator. In V2 the
 * college list is derived from the HPU-167 dataset via @hp-mis/fixtures — the
 * rest (course catalogue, BA combinations, per-offering seat split) stays
 * locally curated so the demo flow remains deterministic.
 *
 * Everything downstream still reads from the same `COLLEGES / COURSES /
 * OFFERINGS / COMBINATIONS` exports; the underlying data source changed but
 * the public shape is unchanged.
 */

import {
  COLLEGES as HP_COLLEGES,
  HP_DISTRICTS,
  type HPCollege,
} from "@hp-mis/fixtures";

export type StreamRequirement = "any" | "arts" | "pcm" | "pcb" | "commerce";

/**
 * Student-side view of a college. The richer HPCollege attributes
 * (coEd / hostel / website / type-of-institution) live on the detail page;
 * this shape is kept narrow for the discover grid.
 */
export interface College {
  id: string;
  shortCode: string;
  name: string;
  /** District display name — from HP_DISTRICTS (English). */
  district: string;
  type: "government_degree" | "sanskrit";
  aisheCode: string;
  departments: string[];
  // Pass-through from HP dataset so UI can surface extra details.
  coEdStatus: HPCollege["coEdStatus"];
  hostelAvailable: HPCollege["hostelAvailable"];
  shortName: string;
  website?: string;
}

export interface Course {
  id: string;
  code: string;
  nameKey: string;
  descriptionKey: string;
  streamRequired: StreamRequirement;
  minMarks: number;
  durationYears: number;
  combinationBased: boolean;
}

export interface Offering {
  id: string;
  collegeId: string;
  courseId: string;
  totalSeats: number;
  vacantSeats: number;
  /** i18n key — when set, the evaluator flips the state to `conditional` and appends this reason. */
  conditionalReasonKey?: string;
}

export interface Combination {
  id: string;
  collegeId: string;
  courseId: string;
  subjectA: string;
  subjectB: string;
  bucketA: string;
  bucketB: string;
  totalSeats: number;
  vacantSeats: number;
}

// ---------- Courses (manually curated — catalogue of UG courses we route) ----------

export const COURSES: readonly Course[] = [
  {
    id: "ba",
    code: "BA",
    nameKey: "discover.course.names.ba",
    descriptionKey: "discover.course.descriptions.ba",
    streamRequired: "any",
    minMarks: 40,
    durationYears: 3,
    combinationBased: true,
  },
  {
    id: "bcom",
    code: "BCom",
    nameKey: "discover.course.names.bcom",
    descriptionKey: "discover.course.descriptions.bcom",
    streamRequired: "any",
    minMarks: 50,
    durationYears: 3,
    combinationBased: false,
  },
  {
    id: "bsc_nonmed",
    code: "BSc Non-Med",
    nameKey: "discover.course.names.bsc_nonmed",
    descriptionKey: "discover.course.descriptions.bsc_nonmed",
    streamRequired: "pcm",
    minMarks: 50,
    durationYears: 3,
    combinationBased: false,
  },
  {
    id: "bsc_med",
    code: "BSc Med",
    nameKey: "discover.course.names.bsc_med",
    descriptionKey: "discover.course.descriptions.bsc_med",
    streamRequired: "pcb",
    minMarks: 50,
    durationYears: 3,
    combinationBased: false,
  },
  {
    id: "bca",
    code: "BCA",
    nameKey: "discover.course.names.bca",
    descriptionKey: "discover.course.descriptions.bca",
    streamRequired: "any",
    minMarks: 55,
    durationYears: 3,
    combinationBased: false,
  },
  {
    id: "bba",
    code: "BBA",
    nameKey: "discover.course.names.bba",
    descriptionKey: "discover.course.descriptions.bba",
    streamRequired: "any",
    minMarks: 50,
    durationYears: 3,
    combinationBased: false,
  },
  {
    id: "bvoc",
    code: "BVoc",
    nameKey: "discover.course.names.bvoc",
    descriptionKey: "discover.course.descriptions.bvoc",
    streamRequired: "any",
    minMarks: 45,
    durationYears: 3,
    combinationBased: false,
  },
];

// ---------- Colleges (derived from HPU-167 dataset) ----------

const DISTRICT_NAME: Record<string, string> = Object.fromEntries(
  HP_DISTRICTS.map((d) => [d.id, d.name]),
);

/** Courses we actually surface on the discover flow. Medical / pharmacy /
 *  engineering colleges from the fixture don't enter this catalogue and so
 *  won't produce offerings (they're handled through separate national exams
 *  in real HP admissions). */
const DISCOVER_COURSE_CODES: Record<string, string> = {
  BA: "ba",
  BCom: "bcom",
  BSc: "bsc_nonmed",
  "BSc-Hons": "bsc_nonmed",
  BCA: "bca",
  BBA: "bba",
  BVoc: "bvoc",
};

function shortCode(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .filter((c) => c && /[A-Za-z]/.test(c))
    .slice(0, 5)
    .join("")
    .toUpperCase();
}

function inferDepartments(c: HPCollege): string[] {
  const labels: string[] = [];
  const codes = c.coursesOffered;
  if (codes.some((k) => ["BA"].includes(k))) labels.push("Humanities");
  if (codes.some((k) => ["BCom", "BBA"].includes(k))) labels.push("Commerce");
  if (codes.some((k) => ["BSc", "BSc-Hons"].includes(k))) labels.push("Science");
  if (codes.some((k) => ["BCA"].includes(k))) labels.push("Computer Applications");
  if (codes.some((k) => ["BVoc"].includes(k))) labels.push("Vocational");
  return labels.length > 0 ? labels : ["Humanities"];
}

/**
 * Student-facing college list = every HP-167 college that offers at least one
 * discover-eligible course. Keeps the list realistic and manageable.
 */
export const COLLEGES: readonly College[] = HP_COLLEGES
  .filter(
    (c) =>
      c.isActive &&
      (c.type === "government_degree" || c.type === "sanskrit") &&
      c.coursesOffered.some((code) => code in DISCOVER_COURSE_CODES),
  )
  .map((c) => ({
    id: c.id,
    shortCode: shortCode(c.shortName),
    name: c.name,
    shortName: c.shortName,
    district: DISTRICT_NAME[c.district] ?? c.district,
    type: c.type === "sanskrit" ? "sanskrit" : "government_degree",
    aisheCode: c.aisheCode,
    departments: inferDepartments(c),
    coEdStatus: c.coEdStatus,
    hostelAvailable: c.hostelAvailable,
    website: c.website,
  }));

// ---------- Offerings (derived per college × course with sensible seat split) ----------

/**
 * Deterministic seat math: split the college's total intake across the
 * courses it offers, clamp to a minimum, and apply an 85 % vacancy ratio
 * so numbers feel realistic without randomness.
 */
function seatsFor(total: number, courseCount: number): { totalSeats: number; vacantSeats: number } {
  const perCourse = Math.max(60, Math.round(total / Math.max(1, courseCount) / 30) * 30);
  const vacant = Math.max(30, Math.round(perCourse * 0.85));
  return { totalSeats: perCourse, vacantSeats: vacant };
}

/** Conditional overrides — keeps the Sanjauli field-visit "teacher strength clamps BA seats" moment from the original curation. */
const CONDITIONAL_OFFERING_REASONS: Record<string, string> = {
  "rkmv_shimla:ba": "discover.reason.teacherCountReview",
};

export const OFFERINGS: readonly Offering[] = (() => {
  const out: Offering[] = [];
  for (const college of COLLEGES) {
    const hp = HP_COLLEGES.find((c) => c.id === college.id);
    if (!hp) continue;
    const recognisedCodes = hp.coursesOffered.filter((code) => code in DISCOVER_COURSE_CODES);
    for (const code of recognisedCodes) {
      const courseId = DISCOVER_COURSE_CODES[code]!;
      const { totalSeats, vacantSeats } = seatsFor(hp.totalSanctionedSeats, recognisedCodes.length);
      const offeringId = `${college.id}:${courseId}`;
      out.push({
        id: offeringId,
        collegeId: college.id,
        courseId,
        totalSeats,
        vacantSeats,
        conditionalReasonKey: CONDITIONAL_OFFERING_REASONS[offeringId],
      });
    }
  }
  // RKMV is the only BSc Medical provider in the demo — append explicitly
  // because the HPU dataset doesn't split BSc by Med / Non-Med. Without this
  // override, the Med/PCB gate can't fire anywhere.
  const rkmv = HP_COLLEGES.find((c) => c.id === "rkmv_shimla");
  if (rkmv) {
    out.push({
      id: "rkmv_shimla:bsc_med",
      collegeId: "rkmv_shimla",
      courseId: "bsc_med",
      totalSeats: 60,
      vacantSeats: 55,
    });
  }
  return out;
})();

// ---------- BA combinations (hand-curated per §12.1) ----------

export const COMBINATIONS: readonly Combination[] = [
  { id: "gc_sanjauli:hist_pol", collegeId: "gc_sanjauli", courseId: "ba", subjectA: "History", subjectB: "Political Science", bucketA: "B1", bucketB: "B2", totalSeats: 60, vacantSeats: 52 },
  { id: "gc_sanjauli:eng_eco", collegeId: "gc_sanjauli", courseId: "ba", subjectA: "English", subjectB: "Economics", bucketA: "B3", bucketB: "B4", totalSeats: 60, vacantSeats: 48 },
  { id: "gc_sanjauli:hindi_eco", collegeId: "gc_sanjauli", courseId: "ba", subjectA: "Hindi", subjectB: "Economics", bucketA: "B3", bucketB: "B4", totalSeats: 40, vacantSeats: 30 },
  { id: "gc_sanjauli:soc_pol", collegeId: "gc_sanjauli", courseId: "ba", subjectA: "Sociology", subjectB: "Political Science", bucketA: "B1", bucketB: "B2", totalSeats: 40, vacantSeats: 36 },
  { id: "gc_sanjauli:geo_hist", collegeId: "gc_sanjauli", courseId: "ba", subjectA: "Geography", subjectB: "History", bucketA: "B1", bucketB: "B2", totalSeats: 40, vacantSeats: 38 },
  { id: "gc_sanjauli:music_hist", collegeId: "gc_sanjauli", courseId: "ba", subjectA: "Music", subjectB: "History", bucketA: "B5", bucketB: "B1", totalSeats: 30, vacantSeats: 28 },
  { id: "rkmv:eng_hindi", collegeId: "rkmv_shimla", courseId: "ba", subjectA: "English", subjectB: "Hindi", bucketA: "B3", bucketB: "B4", totalSeats: 60, vacantSeats: 55 },
  { id: "rkmv:hist_eco", collegeId: "rkmv_shimla", courseId: "ba", subjectA: "History", subjectB: "Economics", bucketA: "B1", bucketB: "B4", totalSeats: 60, vacantSeats: 50 },
  { id: "rkmv:pol_soc", collegeId: "rkmv_shimla", courseId: "ba", subjectA: "Political Science", subjectB: "Sociology", bucketA: "B2", bucketB: "B1", totalSeats: 50, vacantSeats: 45 },
  { id: "rkmv:math_eco", collegeId: "rkmv_shimla", courseId: "ba", subjectA: "Mathematics", subjectB: "Economics", bucketA: "B6", bucketB: "B4", totalSeats: 40, vacantSeats: 35 },
  { id: "gc_dharamshala:eng_eco", collegeId: "gc_dharamshala", courseId: "ba", subjectA: "English", subjectB: "Economics", bucketA: "B3", bucketB: "B4", totalSeats: 60, vacantSeats: 50 },
  { id: "gc_dharamshala:hist_pol", collegeId: "gc_dharamshala", courseId: "ba", subjectA: "History", subjectB: "Political Science", bucketA: "B1", bucketB: "B2", totalSeats: 60, vacantSeats: 55 },
  { id: "gc_dharamshala:hindi_soc", collegeId: "gc_dharamshala", courseId: "ba", subjectA: "Hindi", subjectB: "Sociology", bucketA: "B3", bucketB: "B1", totalSeats: 40, vacantSeats: 36 },
  { id: "gc_palampur:hist_eco", collegeId: "gc_palampur", courseId: "ba", subjectA: "History", subjectB: "Economics", bucketA: "B1", bucketB: "B4", totalSeats: 60, vacantSeats: 55 },
  { id: "gc_palampur:pol_eng", collegeId: "gc_palampur", courseId: "ba", subjectA: "Political Science", subjectB: "English", bucketA: "B2", bucketB: "B3", totalSeats: 60, vacantSeats: 50 },
  { id: "vallabh_mandi:hist_pol", collegeId: "vallabh_mandi", courseId: "ba", subjectA: "History", subjectB: "Political Science", bucketA: "B1", bucketB: "B2", totalSeats: 60, vacantSeats: 55 },
  { id: "vallabh_mandi:hindi_eco", collegeId: "vallabh_mandi", courseId: "ba", subjectA: "Hindi", subjectB: "Economics", bucketA: "B3", bucketB: "B4", totalSeats: 60, vacantSeats: 52 },
  { id: "gc_solan:eng_hist", collegeId: "gc_solan", courseId: "ba", subjectA: "English", subjectB: "History", bucketA: "B3", bucketB: "B1", totalSeats: 60, vacantSeats: 55 },
  { id: "gc_solan:hindi_pol", collegeId: "gc_solan", courseId: "ba", subjectA: "Hindi", subjectB: "Political Science", bucketA: "B3", bucketB: "B2", totalSeats: 60, vacantSeats: 50 },
];

// ---------- Lookup helpers ----------

const COLLEGE_BY_ID: Record<string, College> = Object.fromEntries(COLLEGES.map((c) => [c.id, c]));
const COURSE_BY_ID: Record<string, Course> = Object.fromEntries(COURSES.map((c) => [c.id, c]));

export function getCollege(id: string): College | undefined {
  return COLLEGE_BY_ID[id];
}
export function getCourse(id: string): Course | undefined {
  return COURSE_BY_ID[id];
}
export function combinationsFor(collegeId: string, courseId: string): Combination[] {
  return COMBINATIONS.filter((c) => c.collegeId === collegeId && c.courseId === courseId);
}
export function offeringsFor(collegeId?: string, courseId?: string): Offering[] {
  return OFFERINGS.filter(
    (o) => (!collegeId || o.collegeId === collegeId) && (!courseId || o.courseId === courseId),
  );
}

export function uniqueDistricts(): string[] {
  return Array.from(new Set(COLLEGES.map((c) => c.district))).sort();
}

/**
 * Deterministic mock distance (km) between the student's saved district and
 * a given college id. No real geolocation — purely a stable, per-college hash
 * so the UI feels like a real "distance from you" filter. When the student's
 * district matches the college's district the value is small (<= 15 km).
 */
export function mockDistanceKm(collegeId: string, studentDistrict: string): number {
  const college = COLLEGE_BY_ID[collegeId];
  if (!college) return 999;
  const sameDistrict =
    studentDistrict && college.district.toLowerCase() === studentDistrict.toLowerCase();
  // Stable hash on the college id.
  let h = 0;
  for (let i = 0; i < collegeId.length; i++) {
    h = (h * 31 + collegeId.charCodeAt(i)) | 0;
  }
  const base = ((h >>> 0) % 180) + 5; // 5 – 184 km
  if (sameDistrict) return Math.max(1, base % 16); // 1 – 15 km
  return base;
}
