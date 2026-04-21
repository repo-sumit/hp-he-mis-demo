import type { ProfileDraft } from "../profile/profile-provider";
import { buildChecklist, type ChecklistItem } from "../documents/document-rules";
import type { DocumentEntry } from "../documents/documents-provider";

export type ProfileStep = 1 | 2 | 3 | 4 | 5;

/**
 * A single missing profile field, describable at the review level. `step`
 * drives the Edit target, `focus` drives the in-page scroll-to anchor, and
 * `labelKey` is an i18n key for the row message (e.g. "Mobile number
 * missing").
 */
export interface MissingProfileField {
  key: keyof ProfileDraft;
  step: ProfileStep;
  focus: string;
  labelKey: string;
}

export interface ProfileReadiness {
  ok: boolean;
  missing: number;
  missingFields: MissingProfileField[];
}

export interface DocumentsReadiness {
  ok: boolean;
  required: number;
  uploaded: number;
  verified: number;
  requiredItems: ChecklistItem[];
  /** Required items whose status is still `not_uploaded`. */
  missingItems: ChecklistItem[];
}

export interface PreferencesReadiness {
  ok: boolean;
  count: number;
}

export interface Readiness {
  profile: ProfileReadiness;
  documents: DocumentsReadiness;
  preferences: PreferencesReadiness;
  canSubmit: boolean;
}

/**
 * Full specification of every required profile field, ordered by where a
 * student would naturally fill it in. Each entry tells the review page
 * where to send the Edit link (step) and which input to focus (focus id),
 * plus a human label.
 */
/*
 * Note: `email` is captured authoritatively at registration / login and
 * synced into the profile draft there. It is intentionally absent from
 * this list so readiness never flags it as missing — even on a mobile-only
 * OTP session where `draft.email` may be empty, the review row falls back
 * to a tolerant "Captured at login" value.
 */
const PROFILE_FIELDS: readonly MissingProfileField[] = [
  { key: "fullName", step: 1, focus: "fullName", labelKey: "review.missing.fullName" },
  { key: "dob", step: 1, focus: "dob", labelKey: "review.missing.dob" },
  { key: "gender", step: 1, focus: "gender", labelKey: "review.missing.gender" },
  { key: "mobile", step: 1, focus: "mobile", labelKey: "review.missing.mobile" },
  { key: "category", step: 1, focus: "category", labelKey: "review.missing.category" },
  { key: "permanentAddress", step: 2, focus: "permanentAddress", labelKey: "review.missing.permanentAddress" },
  { key: "district", step: 2, focus: "district", labelKey: "review.missing.district" },
  { key: "pincode", step: 2, focus: "pincode", labelKey: "review.missing.pincode" },
  { key: "board", step: 3, focus: "board", labelKey: "review.missing.board" },
  { key: "yearOfPassing", step: 3, focus: "yearOfPassing", labelKey: "review.missing.yearOfPassing" },
  { key: "stream", step: 3, focus: "stream", labelKey: "review.missing.stream" },
  { key: "bofPercentage", step: 3, focus: "bofPercentage", labelKey: "review.missing.bofPercentage" },
  { key: "resultStatus", step: 3, focus: "resultStatus", labelKey: "review.missing.resultStatus" },
];

function isEmptyValue(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === "string") return value.trim() === "";
  return false;
}

/**
 * Three-gate readiness check for a given course application: profile filled,
 * required documents uploaded (based on the dynamic checklist derived from the
 * profile), and at least one preference ranked. All three must pass for submit.
 */
export function computeReadiness(
  draft: ProfileDraft,
  documents: Record<string, DocumentEntry>,
  preferenceCount: number,
): Readiness {
  const missingFields = PROFILE_FIELDS.filter((field) =>
    isEmptyValue(draft[field.key]),
  );
  const profile: ProfileReadiness = {
    ok: missingFields.length === 0,
    missing: missingFields.length,
    missingFields,
  };

  const requiredItems = buildChecklist(draft).filter((item) => item.required);
  const missingItems: ChecklistItem[] = [];
  let uploaded = 0;
  let verified = 0;
  for (const item of requiredItems) {
    const status = documents[item.rule.code]?.status ?? "not_uploaded";
    if (status !== "not_uploaded") uploaded++;
    else missingItems.push(item);
    if (status === "verified") verified++;
  }
  const documentsReadiness: DocumentsReadiness = {
    ok: requiredItems.length > 0 && uploaded === requiredItems.length,
    required: requiredItems.length,
    uploaded,
    verified,
    requiredItems,
    missingItems,
  };

  const preferences: PreferencesReadiness = {
    ok: preferenceCount > 0,
    count: preferenceCount,
  };

  return {
    profile,
    documents: documentsReadiness,
    preferences,
    canSubmit: profile.ok && documentsReadiness.ok && preferences.ok,
  };
}
