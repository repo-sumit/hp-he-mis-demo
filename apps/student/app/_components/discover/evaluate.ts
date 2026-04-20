import type { ProfileDraft } from "../profile/profile-provider";
import {
  COURSES,
  OFFERINGS,
  getCollege,
  getCourse,
  type Course,
  type Offering,
  type StreamRequirement,
} from "./mock-data";

export type EligibilityState = "eligible" | "conditional" | "not_eligible";

export interface EligibilityReason {
  key: string;
  vars?: Record<string, string | number>;
}

export interface EligibilityResult {
  id: string;
  offering: Offering;
  course: Course;
  collegeId: string;
  courseId: string;
  state: EligibilityState;
  reasons: EligibilityReason[];
}

/**
 * True if the student picked enough of their Class 12 record for us to evaluate
 * anything meaningfully. We stop short of insisting on every field — stream +
 * marks + board are the trio the engine actually needs.
 */
export function hasEnoughProfile(draft: ProfileDraft | null | undefined): boolean {
  if (!draft) return false;
  return Boolean(draft.stream && draft.bofPercentage && draft.board);
}

/**
 * Count of profile wizard steps still to be completed (1..5).
 * Returns 0 once every step has at least one signalling field filled.
 * Used by the dashboard's "Finish profile" next-action card so the copy
 * says "2 more steps" instead of a hard-coded 3.
 */
export function remainingProfileSteps(draft: ProfileDraft | null | undefined): number {
  if (!draft) return 5;
  const step1Done = Boolean(draft.fullName && draft.dob && draft.mobile && draft.email);
  const step2Done = Boolean(draft.permanentAddress && draft.district && draft.pincode);
  const step3Done = Boolean(draft.board && draft.stream && draft.bofPercentage && draft.resultStatus);
  // Step 4 is only "needed" if there are claims to resolve. An empty claims
  // list is a valid completed state (e.g. General with no special claims).
  const step4Done = Array.isArray(draft.claims);
  const step5Done = Boolean(draft.accountHolder && draft.accountNumber && draft.ifsc);
  return [step1Done, step2Done, step3Done, step4Done, step5Done].filter((d) => !d).length;
}

function matchesStream(
  studentStream: ProfileDraft["stream"],
  required: StreamRequirement,
): boolean {
  if (required === "any") return true;
  if (!studentStream) return false;
  return studentStream === required;
}

function streamLabelKey(value: StreamRequirement | ProfileDraft["stream"]): string {
  if (!value) return "discover.stream.any";
  if (value === "any") return "discover.stream.any";
  return `discover.stream.${value}`;
}

function evaluateOne(offering: Offering, course: Course, draft: ProfileDraft): EligibilityResult {
  const reasons: EligibilityReason[] = [];
  let state: EligibilityState = "eligible";

  // Fail at Class 12 → hard block for the whole cycle.
  if (draft.resultStatus === "fail") {
    state = "not_eligible";
    reasons.push({ key: "discover.reason.failedClass12" });
  }

  // Stream gate (hard) — PCM / PCB are absolute per §2.3.
  if (state !== "not_eligible" && !matchesStream(draft.stream, course.streamRequired)) {
    state = "not_eligible";
    reasons.push({
      key: "discover.reason.streamMismatch",
      vars: {
        required: `__i18n:${streamLabelKey(course.streamRequired)}`,
        yours: `__i18n:${streamLabelKey(draft.stream)}`,
      },
    });
  }

  // Minimum best-of-five.
  if (state !== "not_eligible") {
    const bof = Number(draft.bofPercentage);
    if (!Number.isNaN(bof) && bof > 0 && bof < course.minMarks) {
      state = "not_eligible";
      reasons.push({
        key: "discover.reason.belowMinMarks",
        vars: { min: course.minMarks, yours: bof },
      });
    }
  }

  // Compartment → conditional (can apply, must clear before admission).
  if (state === "eligible" && draft.resultStatus === "compartment") {
    state = "conditional";
    reasons.push({ key: "discover.reason.compartment" });
  }

  // Gap years → conditional (affidavit required).
  if (state === "eligible") {
    const gap = Number(draft.gapYears);
    if (!Number.isNaN(gap) && gap > 0) {
      state = "conditional";
      reasons.push({ key: "discover.reason.gapYears", vars: { n: gap } });
    }
  }

  // Non-HP domicile — student can still apply but needs the domicile cert.
  if (state === "eligible" && draft.state && draft.state !== "Himachal Pradesh") {
    state = "conditional";
    reasons.push({ key: "discover.reason.outsideHpDomicile" });
  }

  // Offering-level note (teacher-count review at RKMV BA).
  if (state === "eligible" && offering.conditionalReasonKey) {
    state = "conditional";
    reasons.push({ key: offering.conditionalReasonKey });
  }

  return {
    id: offering.id,
    offering,
    course,
    collegeId: offering.collegeId,
    courseId: offering.courseId,
    state,
    reasons,
  };
}

export function evaluateAll(draft: ProfileDraft): EligibilityResult[] {
  const results: EligibilityResult[] = [];
  for (const offering of OFFERINGS) {
    const course = getCourse(offering.courseId);
    const college = getCollege(offering.collegeId);
    if (!course || !college) continue;
    results.push(evaluateOne(offering, course, draft));
  }
  return results;
}

/** Helper used by the badge to pick the right copy / tone. */
export const STATE_ORDER: readonly EligibilityState[] = [
  "eligible",
  "conditional",
  "not_eligible",
];

export function stateRank(state: EligibilityState): number {
  return STATE_ORDER.indexOf(state);
}

export { COURSES };
