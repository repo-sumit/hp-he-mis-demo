import type { DocStatus } from "../documents/document-rules";
import type { DocumentEntry } from "../documents/documents-provider";
import type { BridgeDiscrepancy } from "./scrutiny-bridge-provider";

export interface EffectiveDoc {
  status: DocStatus;
  rejectionReason?: string;
  /** The unresolved discrepancy driving the override, if any. */
  discrepancy?: BridgeDiscrepancy;
}

/**
 * Merges the student's DocumentsProvider entry with any bridge discrepancy
 * for the same code. When the college has flagged a document and the student
 * hasn't re-uploaded yet, we force "rejected" so the vault routes correctly.
 * Once the student re-uploads (or taps Mark as updated), the bridge entry
 * carries `studentActionAt` and the base entry's newer status wins.
 */
export function resolveEffectiveDoc(
  entry: DocumentEntry,
  openDiscrepancies: BridgeDiscrepancy[],
): EffectiveDoc {
  // Most recent unresolved doc discrepancy wins.
  const open = openDiscrepancies.find((d) => !d.studentActionAt);
  if (open) {
    const discReason = open.reasonEn;
    return {
      status: "rejected",
      rejectionReason: entry.rejectionReason ?? discReason,
      discrepancy: open,
    };
  }
  // Resolved discrepancy + no new upload → stay as whatever the entry says,
  // but ensure we don't surface the stale rejected state. If the base entry
  // is still "not_uploaded", bump to "under_review" as a soft reassurance.
  const resolved = openDiscrepancies.find((d) => d.studentActionAt);
  if (resolved && entry.status === "not_uploaded") {
    return {
      status: "under_review",
      discrepancy: resolved,
    };
  }
  return { status: entry.status, rejectionReason: entry.rejectionReason };
}
