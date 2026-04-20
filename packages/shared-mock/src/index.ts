/**
 * Shared scrutiny contract between the admin portal and the student mini app.
 *
 * Both surfaces read and write the same `hp-mis:scrutiny` localStorage key so
 * discrepancies raised on the portal show up on the student dashboard after
 * reload. In development the two apps run on different ports (3001 / 3002),
 * which makes localStorage per-origin — for the shell we seed equivalent
 * fixtures on each side so the loop is demonstrable either way. In a deployed
 * build (same origin) the round-trip is live. Moving this to a real backend
 * later is a matter of replacing `loadOverlayMap`/`persistOverlayMap` with an
 * API client; the shapes stay identical.
 */

export type FieldOutcome = "verified" | "flagged" | "rejected";

export type DocOutcome = "verified" | "rejected" | "under_review";

export type DiscrepancyScope = "personal" | "academic" | "reservation" | "document";

export type AppBaseStatus =
  | "submitted"
  | "under_scrutiny"
  | "discrepancy_raised"
  | "verified"
  | "rejected"
  | "conditional";

export interface ScrutinyDiscrepancy {
  id: string;
  scope: DiscrepancyScope;
  /** Extra context — for document discrepancies, the document code. */
  targetRef?: string;
  reasonEn: string;
  reasonHi: string;
  deadline: string;
  createdAt: number;
  createdBy: string;
  /** Set by the student when they fix or re-upload — flips the UI into the
   *  "sent for re-check" state without needing a real server round-trip. */
  studentActionAt?: number;
}

export interface ScrutinyHistoryEntry {
  at: number;
  actor: string;
  action: string;
  target?: string;
  note?: string;
}

export interface ScrutinyOverlay {
  fieldOutcomes: Record<string, FieldOutcome>;
  docOutcomes: Record<string, { outcome: DocOutcome; reason?: string; at: number }>;
  discrepancies: ScrutinyDiscrepancy[];
  statusOverride?: AppBaseStatus;
  history: ScrutinyHistoryEntry[];
  lastTouchedAt?: number;
}

export type ScrutinyOverlayMap = Record<string, ScrutinyOverlay>;

export const SCRUTINY_STORAGE_KEY = "hp-mis:scrutiny";

export function emptyOverlay(): ScrutinyOverlay {
  return {
    fieldOutcomes: {},
    docOutcomes: {},
    discrepancies: [],
    history: [],
  };
}

export function loadOverlayMap(): ScrutinyOverlayMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(SCRUTINY_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object") return parsed as ScrutinyOverlayMap;
    return {};
  } catch {
    return {};
  }
}

export function persistOverlayMap(map: ScrutinyOverlayMap): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SCRUTINY_STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* swallow — quota errors in demo are non-blocking */
  }
}

/** Priority order used when showing a single "headline" discrepancy (e.g. on
 *  the student dashboard). Documents unblock merit, academics are second. */
const SCOPE_PRIORITY: Record<DiscrepancyScope, number> = {
  document: 0,
  academic: 1,
  reservation: 2,
  personal: 3,
};

export function sortDiscrepancies(a: ScrutinyDiscrepancy, b: ScrutinyDiscrepancy): number {
  // Unresolved first (no studentActionAt), then by scope priority, then oldest first.
  const aResolved = a.studentActionAt ? 1 : 0;
  const bResolved = b.studentActionAt ? 1 : 0;
  if (aResolved !== bResolved) return aResolved - bResolved;
  const byScope = SCOPE_PRIORITY[a.scope] - SCOPE_PRIORITY[b.scope];
  if (byScope !== 0) return byScope;
  return a.createdAt - b.createdAt;
}

export function generateDiscrepancyId(): string {
  return `disc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}
