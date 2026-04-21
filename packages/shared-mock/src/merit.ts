/**
 * Merit overlay — extends the shared-mock layer with a demo-grade merit list
 * that the portal /merit page writes and the student dashboard reads.
 *
 * Shape stays compatible with the real MeritList entity (§8 of the project
 * context) so this localStorage-backed mock swaps cleanly for a server API
 * when one lands. One entry per `courseId`; each entry carries the ranked
 * list at publish time plus a timestamp and the reviewer who hit Publish.
 */

export interface MeritRankEntry {
  /** Application number (HP-ADM-2026-NNNNNN). */
  applicationId: string;
  /** 1-indexed rank within this course's merit list. */
  rank: number;
  /** Best-of-five at the time of merit computation. Preserved so the audit
   *  trail still makes sense if the student profile is edited later. */
  bofPercentage: number;
  /** Category under which this rank was computed. */
  category: "general" | "ews" | "obc" | "sc" | "st";
  /** Student's DOB — used for the tie-breaker in `computeMeritRanks`. */
  dob: string;
  /** Student name, snapshot for the merit-list display. */
  studentName: string;
  /** Course code, snapshot. */
  courseCode: string;
  /** First preference's college id (handy when allocation runs later). */
  firstPreferenceCollegeId: string;
}

export interface MeritOverlay {
  courseId: string;
  publishedAt: number;
  publishedBy: string;
  ranks: MeritRankEntry[];
  /** Increments every time the course merit is re-published. */
  publishVersion: number;
}

export type MeritOverlayMap = Record<string, MeritOverlay>;

export const MERIT_STORAGE_KEY = "hp-mis:merit";

export function loadMeritMap(): MeritOverlayMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(MERIT_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object") return parsed as MeritOverlayMap;
    return {};
  } catch {
    return {};
  }
}

export function persistMeritMap(map: MeritOverlayMap): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(MERIT_STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* swallow — quota errors in demo are non-blocking */
  }
}

/**
 * Minimal student-side payload needed to compute a merit rank. Portal passes
 * in the full `MockApplication` + verified flag; we deliberately keep this
 * shape narrow so the compute function is easy to reason about and test.
 */
export interface MeritCandidate {
  applicationId: string;
  bofPercentage: number;
  dob: string;
  category: MeritRankEntry["category"];
  studentName: string;
  courseCode: string;
  firstPreferenceCollegeId: string;
}

/**
 * Merit computation — verified candidates only, sort by BoF descending,
 * tie-break by older DOB (standard HP ordering from the field visit notes).
 * Returns a fresh ranked list; caller wraps it in a MeritOverlay with
 * publishedAt / publishedBy metadata.
 */
export function computeMeritRanks(candidates: MeritCandidate[]): MeritRankEntry[] {
  const sorted = [...candidates].sort((a, b) => {
    if (a.bofPercentage !== b.bofPercentage) {
      return b.bofPercentage - a.bofPercentage; // higher BoF first
    }
    // Older DOB wins the tie — convert ISO date strings to numbers.
    const aTime = new Date(a.dob).getTime();
    const bTime = new Date(b.dob).getTime();
    return aTime - bTime;
  });
  return sorted.map((c, idx) => ({
    applicationId: c.applicationId,
    rank: idx + 1,
    bofPercentage: c.bofPercentage,
    category: c.category,
    dob: c.dob,
    studentName: c.studentName,
    courseCode: c.courseCode,
    firstPreferenceCollegeId: c.firstPreferenceCollegeId,
  }));
}

/** Has the given course had its merit published? */
export function isMeritPublished(
  map: MeritOverlayMap,
  courseId: string,
): boolean {
  return Boolean(map[courseId]?.publishedAt);
}
