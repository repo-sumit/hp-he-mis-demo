"use client";

import { useSearchParams } from "next/navigation";

/**
 * Section-level edit helper used by every /profile/step/N page.
 *
 * When the user lands on a step via "Edit" on the review screen, the URL
 * carries `?from=review&courseId=<id>` (and optionally `&focus=<field>`).
 * The step uses this helper to:
 *   - swap the submit CTA label ("Save and continue" vs "Save and return to
 *     review") — `inReviewEdit`
 *   - short-circuit the normal step → next step routing and bounce straight
 *     back to the review page — `returnHref`
 *   - scroll the right field into view — `focus`
 *
 * When `from` isn't `review`, every field is undefined so the page keeps its
 * normal behaviour (continue to step N+1).
 */
export interface ReviewReturn {
  /** True when the user arrived via the review-page Edit link. */
  inReviewEdit: boolean;
  /** Course id attached to the review return, if any. */
  courseId: string | null;
  /** Review page the CTA should route back to, or null if not in review-edit mode. */
  returnHref: string | null;
  /** i18n key for the submit button label (continue vs return). */
  saveLabelKey: "cta.saveAndContinue" | "cta.saveAndReturnToReview";
  /** Field id to scroll into focus on mount. */
  focus: string | null;
}

export function useReviewReturn(): ReviewReturn {
  const params = useSearchParams();
  const from = params?.get("from");
  const courseId = params?.get("courseId") ?? null;
  const focus = params?.get("focus") ?? null;

  const inReviewEdit = from === "review" && !!courseId;
  const returnHref = inReviewEdit ? `/apply/${courseId}/review` : null;

  return {
    inReviewEdit,
    courseId,
    returnHref,
    saveLabelKey: inReviewEdit ? "cta.saveAndReturnToReview" : "cta.saveAndContinue",
    focus,
  };
}
