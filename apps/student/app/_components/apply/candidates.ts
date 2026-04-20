import type { ProfileDraft } from "../profile/profile-provider";
import {
  evaluateAll,
  type EligibilityResult,
  type EligibilityState,
} from "../discover/evaluate";
import {
  combinationsFor,
  getCollege,
  getCourse,
  type Combination,
} from "../discover/mock-data";

export type CandidateKind = "offering" | "combination";

export interface PreferenceCandidate {
  /** Stable id used as the preference key — offering id for non-BA, combination id for BA. */
  id: string;
  kind: CandidateKind;
  courseId: string;
  collegeId: string;
  state: EligibilityState;
  totalSeats: number;
  vacantSeats: number;
  /** Populated only for combination-based courses (BA). */
  combination?: Combination;
}

const STATE_RANK: Record<EligibilityState, number> = {
  eligible: 0,
  conditional: 1,
  not_eligible: 2,
};

function sortCandidates(a: PreferenceCandidate, b: PreferenceCandidate): number {
  const byState = STATE_RANK[a.state] - STATE_RANK[b.state];
  if (byState !== 0) return byState;
  return b.vacantSeats - a.vacantSeats;
}

/**
 * Return the candidate list for a given course + current profile draft. Only
 * eligible / conditional results make it through — a not-eligible student
 * cannot add that combination or college to their preferences.
 */
export function buildCandidates(
  courseId: string,
  draft: ProfileDraft,
): PreferenceCandidate[] {
  const course = getCourse(courseId);
  if (!course) return [];

  const results: EligibilityResult[] = evaluateAll(draft).filter(
    (r) => r.courseId === courseId && r.state !== "not_eligible",
  );

  const candidates: PreferenceCandidate[] = [];

  if (course.combinationBased) {
    for (const result of results) {
      for (const combo of combinationsFor(result.collegeId, courseId)) {
        candidates.push({
          id: combo.id,
          kind: "combination",
          courseId,
          collegeId: result.collegeId,
          state: result.state,
          totalSeats: combo.totalSeats,
          vacantSeats: combo.vacantSeats,
          combination: combo,
        });
      }
    }
  } else {
    for (const result of results) {
      candidates.push({
        id: result.offering.id,
        kind: "offering",
        courseId,
        collegeId: result.collegeId,
        state: result.state,
        totalSeats: result.offering.totalSeats,
        vacantSeats: result.offering.vacantSeats,
      });
    }
  }

  return candidates.sort(sortCandidates);
}

/**
 * Number of eligible + conditional candidates for a course — used on /apply
 * hub to decide whether a course card is live or greyed-out.
 */
export function applicableCourseCount(courseId: string, draft: ProfileDraft): number {
  return buildCandidates(courseId, draft).length;
}

/** Look up a single candidate by id within the candidates set for a course. */
export function findCandidate(
  courseId: string,
  id: string,
  draft: ProfileDraft,
): PreferenceCandidate | undefined {
  return buildCandidates(courseId, draft).find((c) => c.id === id);
}

export function candidateCollegeName(candidate: PreferenceCandidate): string {
  return getCollege(candidate.collegeId)?.name ?? candidate.collegeId;
}

export function candidateDistrict(candidate: PreferenceCandidate): string {
  return getCollege(candidate.collegeId)?.district ?? "";
}
