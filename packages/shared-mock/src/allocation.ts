/**
 * Allocation overlay — seat allocation state produced by the portal
 * /allocation page, read by the student allotment page (item 3 in the
 * roadmap). Keyed by `courseId`; each entry carries the round number, the
 * per-student seat offer, the student's response, and a timestamp.
 *
 * Shape matches the Allotment + AllotmentResponse types already declared in
 * `@hp-mis/types` so the swap to a real server is mechanical.
 */

import type { MeritRankEntry } from "./merit";

export type AllotmentResponse =
  | "pending"
  | "freeze"
  | "float"
  | "decline"
  | "auto_cancelled"
  | "fee_paid"
  | "admission_confirmed";

export interface AllocationSeatOffer {
  collegeId: string;
  collegeName: string;
  /** Present only for combination-based courses (BA). */
  combinationLabel?: string;
  /** Government-decided fee for this course type. */
  feeAmount: number;
}

export interface AllocationEntry {
  applicationId: string;
  rank: number;
  studentName: string;
  category: "general" | "ews" | "obc" | "sc" | "st";
  offer: AllocationSeatOffer;
  status: AllotmentResponse;
  offeredAt: number;
  respondedAt?: number;
  /** Roll number assigned after fee payment — populated by item 4 (payment). */
  rollNumber?: string;
}

export interface AllocationOverlay {
  courseId: string;
  roundNumber: number;
  runAt: number;
  runBy: string;
  allocations: AllocationEntry[];
  /** Quick view: N seats across M colleges at start of round. Populated by
   *  the run algorithm so the audit card can render "120 seats filled" etc. */
  seatsOffered: number;
  seatsVacantAfterRound: number;
}

export type AllocationOverlayMap = Record<string, AllocationOverlay>;

export const ALLOCATION_STORAGE_KEY = "hp-mis:allocation";

export function loadAllocationMap(): AllocationOverlayMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(ALLOCATION_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object") return parsed as AllocationOverlayMap;
    return {};
  } catch {
    return {};
  }
}

export function persistAllocationMap(map: AllocationOverlayMap): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ALLOCATION_STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* swallow */
  }
}

/**
 * Inputs needed by `runAllocation` for one course. The portal page gathers
 * these from the existing MockApplication + seat-matrix sources before
 * calling in.
 */
export interface AllocationInputs {
  courseId: string;
  courseCode: string;
  merit: MeritRankEntry[];
  /** Per-college vacant seats for this course. Keyed by collegeId. */
  vacantByCollege: Record<string, number>;
  /** College display names keyed by id (for snapshot inside AllocationEntry). */
  collegeNamesById: Record<string, string>;
  /** Optional — student name lookup keyed by applicationId. If absent we fall
   *  back to the `studentName` on the merit entry. */
  preferencesById?: Record<string, Array<{ collegeId: string; combinationLabel?: string }>>;
  /** Government-decided fee for this course type. */
  feeAmount: number;
}

/**
 * Allocation algorithm — walks the merit list in rank order. For each
 * student we try their first preference's college first (already on the
 * merit entry). If preferencesById is provided and richer, we walk that
 * ranked list to find the highest-ranked preference with a vacant seat.
 * When a seat is offered, vacant count for that college is decremented.
 * Students with no available preference are skipped (they wait for the next
 * round — implemented as Phase 2).
 */
export function runAllocation(
  inputs: AllocationInputs,
  runAt: number,
  runBy: string,
  roundNumber = 1,
): AllocationOverlay {
  // Defensive copy — never mutate the caller's map.
  const vacant: Record<string, number> = { ...inputs.vacantByCollege };
  const allocations: AllocationEntry[] = [];

  for (const merit of inputs.merit) {
    const prefs = inputs.preferencesById?.[merit.applicationId] ?? [
      { collegeId: merit.firstPreferenceCollegeId },
    ];

    let offer: AllocationSeatOffer | null = null;
    for (const pref of prefs) {
      const seatsLeft = vacant[pref.collegeId] ?? 0;
      if (seatsLeft > 0) {
        offer = {
          collegeId: pref.collegeId,
          collegeName:
            inputs.collegeNamesById[pref.collegeId] ?? pref.collegeId,
          combinationLabel: pref.combinationLabel,
          feeAmount: inputs.feeAmount,
        };
        vacant[pref.collegeId] = seatsLeft - 1;
        break;
      }
    }

    if (!offer) {
      // No preference has a seat — skip for now. Round 2 would re-consider.
      continue;
    }

    allocations.push({
      applicationId: merit.applicationId,
      rank: merit.rank,
      studentName: merit.studentName,
      category: merit.category,
      offer,
      status: "pending",
      offeredAt: runAt,
    });
  }

  const seatsVacantAfter = Object.values(vacant).reduce((s, n) => s + n, 0);

  return {
    courseId: inputs.courseId,
    roundNumber,
    runAt,
    runBy,
    allocations,
    seatsOffered: allocations.length,
    seatsVacantAfterRound: seatsVacantAfter,
  };
}

/** Has allocation run at least once for this course? */
export function isAllocationRun(
  map: AllocationOverlayMap,
  courseId: string,
): boolean {
  return Boolean(map[courseId]?.runAt);
}
