/**
 * HPU-167 colleges seed — type definitions plus a small seed of real
 * institutions. The full dataset lands when `HPU_167_Colleges_Data.xlsx`
 * is re-uploaded; a generator script under `scripts/import-hpu-dataset.mjs`
 * will populate the rest of the array. Shapes below match the typical
 * export schema described in V2 Output 7.
 */

export type HPCollegeType =
  | "government_degree"
  | "government_aided"
  | "private"
  | "sanskrit"
  | "autonomous"
  | "medical"
  | "pharmacy"
  | "engineering"
  | "teacher_education"
  | "university"
  | "institute";

export type CoEdStatus = "co_ed" | "women_only" | "men_only";

export type HostelStatus = "none" | "boys" | "girls" | "both";

export interface HPCollege {
  /** AISHE code — unique key (e.g. U-0573). */
  aisheCode: string;
  /** Stable internal id used across the app (typically `gc_<slug>`). */
  id: string;
  /** Full official name (e.g. "Government College Sanjauli"). */
  name: string;
  /** Short display name, safe for table cells. */
  shortName: string;
  /** District id from `HP_DISTRICTS`. */
  district: string;
  /** Optional block/tehsil for hyperlocal filtering. */
  block?: string;
  type: HPCollegeType;
  affiliatingUniversity: string;
  establishedYear?: number;
  coEdStatus: CoEdStatus;
  hostelAvailable: HostelStatus;
  principalName?: string;
  contactPhone?: string;
  contactEmail?: string;
  pinCode?: string;
  /** Course codes offered (BA, BCom, BSc-Med, etc.). */
  coursesOffered: string[];
  /** Baseline total sanctioned seats across all courses. */
  totalSanctionedSeats: number;
  isActive: boolean;
  /** Official college website, when published in the HPU dataset. */
  website?: string;
}

import { HP_COLLEGES } from "./generated/colleges-hpu";

/** Full HPU-167 dataset — 167 colleges across 12 districts. */
export const COLLEGES: readonly HPCollege[] = HP_COLLEGES;

/**
 * Minimal hand-curated seed kept for backward compatibility and fast unit
 * tests. Prefer {@link COLLEGES} for real data.
 */
export const COLLEGES_SEED: readonly HPCollege[] = [
  {
    aisheCode: "U-0147",
    id: "gc_sanjauli",
    name: "Government College Sanjauli",
    shortName: "GC Sanjauli",
    district: "shimla",
    block: "Shimla (Urban)",
    type: "government_degree",
    affiliatingUniversity: "Himachal Pradesh University",
    establishedYear: 1961,
    coEdStatus: "co_ed",
    hostelAvailable: "both",
    principalName: "Dr. Ravi Thakur",
    contactPhone: "0177-2622000",
    contactEmail: "principal@gcsanjauli.ac.in",
    pinCode: "171006",
    coursesOffered: ["BA", "BCom", "BCA"],
    totalSanctionedSeats: 840,
    isActive: true,
  },
  {
    aisheCode: "U-0149",
    id: "rkmv_shimla",
    name: "Rajkiya Kanya Mahavidyalaya Shimla",
    shortName: "RKMV Shimla",
    district: "shimla",
    block: "Shimla (Urban)",
    type: "government_degree",
    affiliatingUniversity: "Himachal Pradesh University",
    establishedYear: 1971,
    coEdStatus: "women_only",
    hostelAvailable: "girls",
    pinCode: "171001",
    coursesOffered: ["BA", "BSc-Med", "BSc-NonMed"],
    totalSanctionedSeats: 600,
    isActive: true,
  },
  {
    aisheCode: "U-0156",
    id: "gc_dharamshala",
    name: "Government College Dharamshala",
    shortName: "GC Dharamshala",
    district: "kangra",
    type: "government_degree",
    affiliatingUniversity: "Himachal Pradesh University",
    establishedYear: 1926,
    coEdStatus: "co_ed",
    hostelAvailable: "both",
    pinCode: "176215",
    coursesOffered: ["BA", "BCom", "BBA"],
    totalSanctionedSeats: 540,
    isActive: true,
  },
  {
    aisheCode: "U-0158",
    id: "gc_palampur",
    name: "Government College Palampur",
    shortName: "GC Palampur",
    district: "kangra",
    type: "government_degree",
    affiliatingUniversity: "Himachal Pradesh University",
    establishedYear: 1978,
    coEdStatus: "co_ed",
    hostelAvailable: "boys",
    pinCode: "176061",
    coursesOffered: ["BA", "BCom"],
    totalSanctionedSeats: 360,
    isActive: true,
  },
  {
    aisheCode: "U-0171",
    id: "vallabh_mandi",
    name: "Vallabh Government College Mandi",
    shortName: "Vallabh GC Mandi",
    district: "mandi",
    type: "government_degree",
    affiliatingUniversity: "Himachal Pradesh University",
    establishedYear: 1948,
    coEdStatus: "co_ed",
    hostelAvailable: "both",
    pinCode: "175001",
    coursesOffered: ["BA", "BSc-NonMed", "BCom"],
    totalSanctionedSeats: 510,
    isActive: true,
  },
  {
    aisheCode: "U-0133",
    id: "gc_solan",
    name: "Government College Solan",
    shortName: "GC Solan",
    district: "solan",
    type: "government_degree",
    affiliatingUniversity: "Himachal Pradesh University",
    establishedYear: 1972,
    coEdStatus: "co_ed",
    hostelAvailable: "both",
    pinCode: "173212",
    coursesOffered: ["BA", "BCom", "BVoc"],
    totalSanctionedSeats: 480,
    isActive: true,
  },
];

const BY_AISHE: Record<string, HPCollege> = Object.fromEntries(
  COLLEGES.map((c) => [c.aisheCode, c]),
);

const BY_ID: Record<string, HPCollege> = Object.fromEntries(
  COLLEGES.map((c) => [c.id, c]),
);

export function getCollegeByAishe(code: string): HPCollege | undefined {
  return BY_AISHE[code];
}

export function getCollegeById(id: string): HPCollege | undefined {
  return BY_ID[id];
}

export function collegesByDistrict(districtId: string): HPCollege[] {
  return COLLEGES.filter((c) => c.district === districtId);
}

/** Count of colleges per district — handy for dashboards. Computed once. */
export const COLLEGE_COUNT_BY_DISTRICT: Record<string, number> = (() => {
  const map: Record<string, number> = {};
  for (const c of COLLEGES) {
    map[c.district] = (map[c.district] || 0) + 1;
  }
  return map;
})();

/** Colleges that offer a given course code (e.g. "BA", "BCom"). */
export function collegesOffering(courseCode: string): HPCollege[] {
  return COLLEGES.filter((c) => c.coursesOffered.includes(courseCode));
}
