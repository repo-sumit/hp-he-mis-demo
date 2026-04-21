import type { DiscrepancyScope, ScrutinyDiscrepancy } from "@hp-mis/shared-mock";

/**
 * Maps a discrepancy to the student-facing screen that actually owns the fix.
 * Used by banners, the dashboard summary card, and the /issues list so every
 * "Fix now" link goes to the right place.
 */
export function routeForIssue(disc: ScrutinyDiscrepancy): string {
  switch (disc.scope) {
    case "document":
      if (disc.targetRef) return `/documents/rejection/${disc.targetRef}`;
      return "/profile/step/4";
    case "academic":
      return "/profile/step/3";
    case "reservation":
      return "/profile/step/4";
    case "personal":
    default:
      return "/profile/step/1";
  }
}

/** Which profile step is owned by a given scope — null if the issue isn't a profile issue. */
export function profileStepForScope(scope: DiscrepancyScope): 1 | 3 | 4 | null {
  switch (scope) {
    case "personal":
      return 1;
    case "academic":
      return 3;
    case "reservation":
      return 4;
    default:
      return null;
  }
}

export function scopeLabelKey(scope: DiscrepancyScope): string {
  return `issue.scope.${scope}`;
}

/** Primary CTA a student should take on a given discrepancy. */
export function ctaKeyForIssue(disc: ScrutinyDiscrepancy): string {
  if (disc.studentActionAt) return "cta.awaitingReview";
  if (disc.scope === "document") return "cta.reUpload";
  return "cta.fixNow";
}
