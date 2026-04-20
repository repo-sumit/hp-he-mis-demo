import type { ProfileDraft } from "../profile/profile-provider";
import { buildChecklist, type ChecklistItem } from "../documents/document-rules";
import type { DocumentEntry } from "../documents/documents-provider";

export interface ProfileReadiness {
  ok: boolean;
  missing: number;
}

export interface DocumentsReadiness {
  ok: boolean;
  required: number;
  uploaded: number;
  verified: number;
  requiredItems: ChecklistItem[];
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

const REQUIRED_PROFILE_FIELDS: Array<keyof ProfileDraft> = [
  "fullName",
  "dob",
  "gender",
  "mobile",
  "email",
  "category",
  "permanentAddress",
  "district",
  "pincode",
  "board",
  "yearOfPassing",
  "stream",
  "bofPercentage",
  "resultStatus",
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
  const profileMissing = REQUIRED_PROFILE_FIELDS.reduce(
    (acc, key) => acc + (isEmptyValue(draft[key]) ? 1 : 0),
    0,
  );
  const profile: ProfileReadiness = { ok: profileMissing === 0, missing: profileMissing };

  const requiredItems = buildChecklist(draft).filter((item) => item.required);
  let uploaded = 0;
  let verified = 0;
  for (const item of requiredItems) {
    const status = documents[item.rule.code]?.status ?? "not_uploaded";
    if (status !== "not_uploaded") uploaded++;
    if (status === "verified") verified++;
  }
  const documentsReadiness: DocumentsReadiness = {
    ok: requiredItems.length > 0 && uploaded === requiredItems.length,
    required: requiredItems.length,
    uploaded,
    verified,
    requiredItems,
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
