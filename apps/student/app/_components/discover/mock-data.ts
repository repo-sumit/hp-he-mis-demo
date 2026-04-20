/**
 * Static mock data for the eligibility-discovery shell. The full offering set
 * lives here so the pure evaluator (see `./evaluate.ts`) has something to work
 * with in the absence of a mock API. Numbers are roughly calibrated against
 * the Sanjauli / RKMV prospectus extracts referenced in docs/project-context.md §12.1.
 */

export type StreamRequirement = "any" | "arts" | "pcm" | "pcb" | "commerce";

export interface College {
  id: string;
  shortCode: string;
  name: string;
  district: string;
  type: "government_degree" | "sanskrit";
  aisheCode: string;
  departments: string[];
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

export const COLLEGES: readonly College[] = [
  {
    id: "gc_sanjauli",
    shortCode: "GCS",
    name: "Government College Sanjauli",
    district: "Shimla",
    type: "government_degree",
    aisheCode: "U-0147",
    departments: ["Humanities", "Commerce", "Computer Applications"],
  },
  {
    id: "rkmv_shimla",
    shortCode: "RKMV",
    name: "RKMV College Shimla",
    district: "Shimla",
    type: "government_degree",
    aisheCode: "U-0149",
    departments: ["Humanities", "Science", "Home Science"],
  },
  {
    id: "gc_dharamshala",
    shortCode: "GCD",
    name: "Government College Dharamshala",
    district: "Kangra",
    type: "government_degree",
    aisheCode: "U-0156",
    departments: ["Humanities", "Commerce", "Management"],
  },
  {
    id: "gc_palampur",
    shortCode: "GCP",
    name: "Government College Palampur",
    district: "Kangra",
    type: "government_degree",
    aisheCode: "U-0158",
    departments: ["Humanities", "Commerce"],
  },
  {
    id: "vallabh_mandi",
    shortCode: "VGC",
    name: "Vallabh Government College Mandi",
    district: "Mandi",
    type: "government_degree",
    aisheCode: "U-0171",
    departments: ["Humanities", "Science", "Commerce"],
  },
  {
    id: "gc_solan",
    shortCode: "GCS-SN",
    name: "Government College Solan",
    district: "Solan",
    type: "government_degree",
    aisheCode: "U-0133",
    departments: ["Humanities", "Commerce", "Vocational"],
  },
];

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

export const OFFERINGS: readonly Offering[] = [
  { id: "gc_sanjauli:ba", collegeId: "gc_sanjauli", courseId: "ba", totalSeats: 600, vacantSeats: 540 },
  { id: "gc_sanjauli:bcom", collegeId: "gc_sanjauli", courseId: "bcom", totalSeats: 120, vacantSeats: 90 },
  { id: "gc_sanjauli:bca", collegeId: "gc_sanjauli", courseId: "bca", totalSeats: 60, vacantSeats: 50 },
  {
    id: "rkmv_shimla:ba",
    collegeId: "rkmv_shimla",
    courseId: "ba",
    totalSeats: 420,
    vacantSeats: 380,
    // Sanjauli field-visit: teacher strength can clamp BA seats before admission — surface as conditional.
    conditionalReasonKey: "discover.reason.teacherCountReview",
  },
  { id: "rkmv_shimla:bsc_nonmed", collegeId: "rkmv_shimla", courseId: "bsc_nonmed", totalSeats: 120, vacantSeats: 110 },
  { id: "rkmv_shimla:bsc_med", collegeId: "rkmv_shimla", courseId: "bsc_med", totalSeats: 60, vacantSeats: 55 },
  { id: "gc_dharamshala:ba", collegeId: "gc_dharamshala", courseId: "ba", totalSeats: 360, vacantSeats: 320 },
  { id: "gc_dharamshala:bcom", collegeId: "gc_dharamshala", courseId: "bcom", totalSeats: 120, vacantSeats: 100 },
  { id: "gc_dharamshala:bba", collegeId: "gc_dharamshala", courseId: "bba", totalSeats: 60, vacantSeats: 45 },
  { id: "gc_palampur:ba", collegeId: "gc_palampur", courseId: "ba", totalSeats: 240, vacantSeats: 210 },
  { id: "gc_palampur:bcom", collegeId: "gc_palampur", courseId: "bcom", totalSeats: 120, vacantSeats: 100 },
  { id: "vallabh_mandi:ba", collegeId: "vallabh_mandi", courseId: "ba", totalSeats: 300, vacantSeats: 270 },
  { id: "vallabh_mandi:bsc_nonmed", collegeId: "vallabh_mandi", courseId: "bsc_nonmed", totalSeats: 90, vacantSeats: 80 },
  { id: "vallabh_mandi:bcom", collegeId: "vallabh_mandi", courseId: "bcom", totalSeats: 120, vacantSeats: 95 },
  { id: "gc_solan:ba", collegeId: "gc_solan", courseId: "ba", totalSeats: 300, vacantSeats: 265 },
  { id: "gc_solan:bcom", collegeId: "gc_solan", courseId: "bcom", totalSeats: 120, vacantSeats: 100 },
  { id: "gc_solan:bvoc", collegeId: "gc_solan", courseId: "bvoc", totalSeats: 60, vacantSeats: 55 },
];

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
