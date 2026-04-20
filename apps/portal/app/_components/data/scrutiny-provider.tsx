"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  SCRUTINY_STORAGE_KEY,
  emptyOverlay,
  generateDiscrepancyId,
  type AppBaseStatus,
  type DiscrepancyScope,
  type DocOutcome,
  type FieldOutcome,
  type ScrutinyDiscrepancy,
  type ScrutinyOverlay,
  type ScrutinyOverlayMap as OverlayMap,
} from "@hp-mis/shared-mock";
import {
  MOCK_APPLICATIONS,
  REVIEWER_NAME,
  getApplication,
  type DocScrutinyStatus,
  type MockApplication,
} from "./mock-applications";

export type { FieldOutcome, DocOutcome, DiscrepancyScope, ScrutinyDiscrepancy, ScrutinyOverlay };

interface Ctx {
  hydrated: boolean;
  overlay: (id: string) => ScrutinyOverlay;
  /** Applies the base + overlay and returns the effective application. */
  effective: (id: string) => MockApplication | undefined;
  effectiveStatus: (id: string) => AppBaseStatus;
  effectiveDocStatus: (id: string, code: string) => DocScrutinyStatus;
  discrepancyCount: (id: string) => number;
  setFieldOutcome: (id: string, fieldKey: string, outcome: FieldOutcome) => void;
  setDocOutcome: (id: string, code: string, outcome: DocOutcome, reason?: string) => void;
  addDiscrepancy: (
    id: string,
    disc: Omit<ScrutinyDiscrepancy, "id" | "createdAt" | "createdBy">,
  ) => ScrutinyDiscrepancy;
  setStatus: (id: string, next: AppBaseStatus, note?: string) => void;
  logOpened: (id: string) => void;
}

const STORAGE_KEY = SCRUTINY_STORAGE_KEY;
const ScrutinyContext = createContext<Ctx | null>(null);

export function ScrutinyProvider({ children }: { children: ReactNode }) {
  const [overlayMap, setOverlayMap] = useState<OverlayMap>({});
  const [hydrated, setHydrated] = useState(false);
  const writeTimer = useRef<number | null>(null);
  const openedOnce = useRef<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setOverlayMap(JSON.parse(raw) as OverlayMap);
    } catch {
      /* start fresh */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (writeTimer.current !== null) window.clearTimeout(writeTimer.current);
    writeTimer.current = window.setTimeout(() => {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(overlayMap));
    }, 200);
    return () => {
      if (writeTimer.current !== null) window.clearTimeout(writeTimer.current);
    };
  }, [overlayMap, hydrated]);

  const getOverlay = useCallback(
    (id: string): ScrutinyOverlay => overlayMap[id] ?? emptyOverlay(),
    [overlayMap],
  );

  const patch = useCallback(
    (id: string, patcher: (prev: ScrutinyOverlay) => ScrutinyOverlay) => {
      setOverlayMap((prev) => {
        const current = prev[id] ?? emptyOverlay();
        const next = patcher(current);
        return { ...prev, [id]: { ...next, lastTouchedAt: Date.now() } };
      });
    },
    [],
  );

  const effectiveStatus = useCallback<Ctx["effectiveStatus"]>(
    (id) => {
      const base = getApplication(id);
      const ov = getOverlay(id);
      return ov.statusOverride ?? base?.baseStatus ?? "submitted";
    },
    [getOverlay],
  );

  const effectiveDocStatus = useCallback<Ctx["effectiveDocStatus"]>(
    (id, code) => {
      const base = getApplication(id);
      const doc = base?.documents.find((d) => d.code === code);
      const overlayDoc = getOverlay(id).docOutcomes[code];
      if (overlayDoc) return overlayDoc.outcome;
      return (doc?.baseStatus ?? "not_uploaded") as DocScrutinyStatus;
    },
    [getOverlay],
  );

  const discrepancyCount = useCallback<Ctx["discrepancyCount"]>(
    (id) => getOverlay(id).discrepancies.length,
    [getOverlay],
  );

  const effective = useCallback<Ctx["effective"]>(
    (id) => {
      const base = getApplication(id);
      if (!base) return undefined;
      const ov = getOverlay(id);
      return {
        ...base,
        baseStatus: ov.statusOverride ?? base.baseStatus,
        documents: base.documents.map((d) => {
          const override = ov.docOutcomes[d.code];
          if (!override) return d;
          return {
            ...d,
            baseStatus: override.outcome,
            rejectionReason: override.reason ?? d.rejectionReason,
          };
        }),
        history: [...base.history, ...ov.history].sort((a, b) => a.at - b.at),
      };
    },
    [getOverlay],
  );

  const setFieldOutcome = useCallback<Ctx["setFieldOutcome"]>(
    (id, fieldKey, outcome) => {
      patch(id, (prev) => ({
        ...prev,
        fieldOutcomes: { ...prev.fieldOutcomes, [fieldKey]: outcome },
        history: [
          ...prev.history,
          {
            at: Date.now(),
            actor: REVIEWER_NAME,
            action: `Field ${outcome}`,
            target: fieldKey,
          },
        ],
      }));
    },
    [patch],
  );

  const setDocOutcome = useCallback<Ctx["setDocOutcome"]>(
    (id, code, outcome, reason) => {
      patch(id, (prev) => ({
        ...prev,
        docOutcomes: {
          ...prev.docOutcomes,
          [code]: { outcome, reason, at: Date.now() },
        },
        history: [
          ...prev.history,
          {
            at: Date.now(),
            actor: REVIEWER_NAME,
            action: outcome === "verified" ? "Verified document" : "Rejected document",
            target: code,
            note: reason,
          },
        ],
      }));
    },
    [patch],
  );

  const addDiscrepancy = useCallback<Ctx["addDiscrepancy"]>(
    (id, input) => {
      const full: ScrutinyDiscrepancy = {
        ...input,
        id: generateDiscrepancyId(),
        createdAt: Date.now(),
        createdBy: REVIEWER_NAME,
      };
      patch(id, (prev) => ({
        ...prev,
        discrepancies: [...prev.discrepancies, full],
        statusOverride: "discrepancy_raised",
        history: [
          ...prev.history,
          {
            at: full.createdAt,
            actor: REVIEWER_NAME,
            action: "Raised discrepancy",
            target: input.scope,
            note: input.reasonEn,
          },
        ],
      }));
      return full;
    },
    [patch],
  );

  const setStatus = useCallback<Ctx["setStatus"]>(
    (id, next, note) => {
      patch(id, (prev) => ({
        ...prev,
        statusOverride: next,
        history: [
          ...prev.history,
          {
            at: Date.now(),
            actor: REVIEWER_NAME,
            action: `Status: ${next.replace(/_/g, " ")}`,
            note,
          },
        ],
      }));
    },
    [patch],
  );

  const logOpened = useCallback<Ctx["logOpened"]>(
    (id) => {
      if (openedOnce.current.has(id)) return;
      openedOnce.current.add(id);
      patch(id, (prev) => ({
        ...prev,
        history: [
          ...prev.history,
          { at: Date.now(), actor: REVIEWER_NAME, action: "Opened application" },
        ],
      }));
    },
    [patch],
  );

  const value = useMemo<Ctx>(
    () => ({
      hydrated,
      overlay: getOverlay,
      effective,
      effectiveStatus,
      effectiveDocStatus,
      discrepancyCount,
      setFieldOutcome,
      setDocOutcome,
      addDiscrepancy,
      setStatus,
      logOpened,
    }),
    [
      hydrated,
      getOverlay,
      effective,
      effectiveStatus,
      effectiveDocStatus,
      discrepancyCount,
      setFieldOutcome,
      setDocOutcome,
      addDiscrepancy,
      setStatus,
      logOpened,
    ],
  );

  return <ScrutinyContext.Provider value={value}>{children}</ScrutinyContext.Provider>;
}

export function useScrutiny(): Ctx {
  const ctx = useContext(ScrutinyContext);
  if (!ctx) throw new Error("useScrutiny must be used inside <ScrutinyProvider>");
  return ctx;
}

/** Helper used by the queue page to derive effective status + discrepancy
 *  count for the entire seeded list without repeatedly calling the hook. */
export function effectiveStatusOf(
  base: MockApplication,
  overlayMap: OverlayMap,
): AppBaseStatus {
  return overlayMap[base.id]?.statusOverride ?? base.baseStatus;
}

export function snapshotAllApplications(overlayMap: OverlayMap): Array<{
  app: MockApplication;
  status: AppBaseStatus;
  discrepancies: number;
}> {
  return MOCK_APPLICATIONS.map((app) => ({
    app,
    status: effectiveStatusOf(app, overlayMap),
    discrepancies: overlayMap[app.id]?.discrepancies.length ?? 0,
  }));
}
